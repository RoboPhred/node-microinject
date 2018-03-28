
import {
    Identifier,
    Newable,
    Scope
} from "../interfaces";

import {
    BindingMap,
    BindingData
} from "../binder/data";

import {
    identifierToString,
    scopeToString
} from "../utils";

import {
    DependencyResolutionError
} from "../errors";

import {
    DependencyGraphNode,
    ComponentCreator,
    ScopeableComponentCreator,
    ScopeDefiningComponentCreator
} from "./interfaces";

import {
    isComponentScopable
} from "./utils";
import { SingletonSymbol } from "../symbols";


export * from "./interfaces";
export * from "./utils";


interface ScopeInstance {
    /**
     * The ComponentCreator that defined this scope.
     * 
     * May be SingletonSymbol as a special case for singleton-scoped services.
     */
    definer: ScopeDefiningComponentCreator | symbol;

    /**
     * Instances of scopable component creators that are scoped to this scope.
     */
    instances: Map<Identifier, ScopeableComponentCreator>
}
type ScopeInstanceMap = Map<Scope, ScopeInstance>;

function getBindingsForIdentifier(identifier: Identifier, bindingsForIdentifier: BindingMap): BindingData[] {
    // TODO: can perform filtering here for conditional bindings.
    return bindingsForIdentifier.get(identifier) || [];
}

function getScopedInstance(identifier: Identifier, binding: BindingData, scopeInstances: ScopeInstanceMap, stack: Identifier[]): ComponentCreator | null {
    if (binding.type === "value") return null;
    const scope = binding.inScope;
    if (!scope) return null;

    const instanceData = scopeInstances.get(scope);
    if (!instanceData) {
        throw new DependencyResolutionError(identifier, stack, `The resolved binding requres scope "${scopeToString(scope)}", but no child object defines this scope.`);
    }

    const instances = instanceData.instances;

    // Being created in a scope, check to see if there is already an
    //  instance of us in this scope.
    if (instances.has(identifier)) {
        return instances.get(identifier)!;
    }

    return null;
}

/**
 * 
 * @param identifier The identifier of the component being scoped.
 * @param binding The binding being used to form the component creator.
 * @param component The component creator.
 * @param scopeInstances The current set of scope instances.
 * @returns The set of scope instances to use for any child component creators.
 */
function tryApplyScoping(identifier: Identifier, binding: BindingData, component: ComponentCreator, scopeInstances: ScopeInstanceMap, stack: Identifier[]): ScopeInstanceMap {
    // Pointless binding type check to make typescript happy.
    if (binding.type === "value") {
        // Value types cannot be scoped, nor can they be within a scope.
        //  This is because we have no way of binding to a specific instance within the scope.
        return scopeInstances;
    }

    // A component that cannot be placed in a scope also cannot serve as a scope itself.
    if (!isComponentScopable(component)) return scopeInstances;

    const {
        inScope,
        defineScope
    } = binding;

    // Check to see if the component is in a scope.
    if (inScope) {
        const instanceData = scopeInstances.get(inScope);
        if (!instanceData) {
            throw new DependencyResolutionError(identifier, stack, `The resolved binding requres scope "${scopeToString(inScope)}", but no child object defines this scope.`);
        }

        // The component is scoped, so add it as The Component for this specific identifier under the component.
        instanceData.instances.set(identifier, component);
        component.containingScope = inScope;

        // We might be being defined by a special case symbol, such as SingletonSymbol.
        if (typeof instanceData.definer !== "symbol") {
            component.containingScopeInstance = instanceData.definer;
        }
    }

    // Check if the component is defining a new scope.
    if (defineScope) {
        // We are a new scope, so set up a new scope instance map that
        //  contains us.  This will be used by children.
        // We need to create a new outer map as new child scopes within a scope should only be accessible within that scope.
        //  We still need to copy the outer scopes, however.  A scope is available to all children unless overrode with another
        //  object defining the same scope.
        component.defineScope = defineScope;
        return new Map(scopeInstances).set(defineScope, {
            definer: component,
            instances: new Map()
        });
    }

    // We are not defining a new scope, so keep passing the existing scope instance map.
    return scopeInstances;
}

function createComponentCreator(identifier: Identifier, binding: BindingData, bindingsForIdentifier: BindingMap, scopeInstances: ScopeInstanceMap, stack: Identifier[]): ComponentCreator {
    if (binding.type === "value") {
        return {
            type: "value",
            value: binding.value
        };
    }

    switch (binding.type) {
        case "factory": {
            const componentCreator: ComponentCreator = {
                type: "factory",
                factory: binding.factory
            };

            tryApplyScoping(identifier, binding, componentCreator, scopeInstances, stack);

            // We cannot plan for anything inside a factory, as the user will
            //  look stuff up at resolution time.
            return componentCreator;
        };
        case "constructor": {
            const {
                ctor,
                injections
            } = binding;
            const ctorArgs: DependencyGraphNode[] = [];

            const componentCreator: ComponentCreator = {
                type: "constructor",
                ctor,
                args: ctorArgs
            };

            // If we are part of a scope, add it before resolving the dependencies.
            //  This may allow for cyclic graphs, but that is the resolver's problem.
            // We need to add it to the current scope set, not the child scope set.
            const childScopeInstances = tryApplyScoping(identifier, binding, componentCreator, scopeInstances, stack);

            // Now we can recurse and resolve our dependencies.
            for (let i = 0; i < injections.length; i++) {
                const {
                    all,
                    optional,
                    identifier: dependencyIdentifier
                } = injections[i];

                let dependencyCreator: ComponentCreator;

                const dependencyBindings = getBindingsForIdentifier(dependencyIdentifier, bindingsForIdentifier);
                if (all) {
                    if (!optional && dependencyBindings.length === 0) {
                        throw new DependencyResolutionError(dependencyIdentifier, stack, `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`);
                    }

                    // If we resolve an All, it must be an array.
                    //  This is even the case when we are optional and no bindings were found.
                    dependencyCreator = {
                        type: "array",
                        values: dependencyBindings.map(binding => ({
                            identifier: dependencyIdentifier,
                            componentCreator: getComponentCreator(dependencyIdentifier, binding, bindingsForIdentifier, childScopeInstances, stack)
                        }))
                    }
                }
                else if (dependencyBindings.length === 0) {
                    // No matching bindings.
                    if (optional) {
                        // We are not an all / array, so the return value for optional is null.
                        dependencyCreator = {
                            type: "value",
                            value: null
                        };
                    }

                    throw new DependencyResolutionError(dependencyIdentifier, stack, `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`);
                }
                else if (dependencyBindings.length > 1) {
                    // Array case was already handled, so this means we do not know what binding to use.
                    throw new DependencyResolutionError(dependencyIdentifier, stack, `More than one binding was resolved for the argument at position ${i} of bound constructor "${ctor.name}".`);
                }
                else {
                    // At this point, we have exactly 1 binding on a 1-value injection.
                    dependencyCreator = getComponentCreator(dependencyIdentifier, dependencyBindings[0], bindingsForIdentifier, childScopeInstances, stack);
                }

                ctorArgs.push({
                    identifier: dependencyIdentifier,
                    componentCreator: dependencyCreator
                });
            }

            // We have now filled in the ctor args, and already added us to the scope if needed.  We are done building this creator.
            return componentCreator;
        };
        default:
            return assertKnownBinding(binding);
    }
}

function getComponentCreator(identifier: Identifier, binding: BindingData, bindingsForIdentifier: BindingMap, scopeInstances: ScopeInstanceMap, stack: Identifier[]): ComponentCreator {
    stack.push(identifier);

    let componentCreator = getScopedInstance(identifier, binding, scopeInstances, stack);
    if (!componentCreator) {
        // If the binding is in a scope, this will register the resulting ComponentCreator with that scope.
        //  This is to support reference loops during dependency lookup.
        componentCreator = createComponentCreator(identifier, binding, bindingsForIdentifier, scopeInstances, stack);
    }

    stack.pop();

    return componentCreator;
}


function createDefaultScopeMap(): ScopeInstanceMap {
    const map = new Map<Scope, ScopeInstance>();
    map.set(SingletonSymbol, {
        definer: SingletonSymbol,
        instances: new Map()
    });
    return map;
}

export function createPlanForBinding(identifier: Identifier, binding: BindingData, bindingsForIdentifier: BindingMap): DependencyGraphNode {
    const componentCreator = createComponentCreator(identifier, binding, bindingsForIdentifier, createDefaultScopeMap(), []);
    return {
        identifier,
        componentCreator
    };
}


export function createPlanForIdentifier(root: Identifier, bindingsForIdentifier: BindingMap): DependencyGraphNode {
    const rootBindings = getBindingsForIdentifier(root, bindingsForIdentifier);
    if (rootBindings.length === 0) {
        throw new DependencyResolutionError(root, [], "No bindings exist for the given identifier.");
    }
    else if (rootBindings.length > 1) {
        throw new DependencyResolutionError(root, [], "More than one binding was resolved for the identifier.");
    }

    return {
        identifier: root,
        componentCreator: getComponentCreator(root, rootBindings[0], bindingsForIdentifier, createDefaultScopeMap(), [])
    };
}



function assertKnownBinding(b: never): never {
    throw new Error(`Encountered unknown binding type "${String((b as BindingData).type)}".`);
}