
import { v4 as uuidv4 } from "uuid";

import {
    Identifier,
    Newable
} from "../interfaces";

import {
    Scope,
    SingletonScope
} from "../scope"

import {
    BindingMap,
    Binding,
    isScopeableBinding,
    ConstructorBindingData,
    FactoryBinding
} from "../binder/data";

import {
    BinderImpl
} from "../binder/binder-impl";

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
    ScopeDefiningComponentCreator,
    ConstructorComponentCreator,
    FactoryComponentCreator
} from "./interfaces";

import {
    isComponentScopable
} from "./utils";


interface ScopeInstance {
    /**
     * The ComponentCreator that defined this scope.
     * 
     * May be SingletonSymbol as a special case for singleton-scoped services.
     */
    definer: ScopeDefiningComponentCreator | symbol;

    /**
     * Instances of scopable component creators that are in this scope.
     */
    instances: Map<Identifier, ScopeableComponentCreator>
}
type ScopeInstanceMap = Map<Scope, ScopeInstance>;

export interface BindingResolver {
    (identifier: Identifier): Binding[];
}

export class DependencyGraphPlanner {
    private _planCache = new Map<Identifier, DependencyGraphNode>();

    /**
     * The current stack of identifiers being planned.
     */
    private _stack: Identifier[] = [];

    /**
     * A map of scopes to scope instance data.
     */
    private _rootScopeInstances: ScopeInstanceMap = new Map();


    constructor(
        private _bindingResolver: BindingResolver
    ) {

        // Prepopulate our singleton scope.
        this._rootScopeInstances.set(SingletonScope, {
            definer: SingletonScope,
            instances: new Map()
        });
    }

    /**
     * Gets a plan for the identifier, optionally using a specific binding.
     * @param identifier The identifier to get a plan for.
     * @param binding An optional binding to use for the identifier.  Useful if multiple bindings may apply.
     */
    getPlan(identifier: Identifier, binding?: Binding): DependencyGraphNode {
        let plan = this._planCache.get(identifier);
        if (plan) {
            return plan;
        }

        if (!binding) {
            const rootBindings = this._getBindings(identifier);
            if (rootBindings.length === 0) {
                throw new DependencyResolutionError(identifier, [], "No bindings exist for the given identifier.");
            }
            else if (rootBindings.length > 1) {
                throw new DependencyResolutionError(identifier, [], "More than one binding was resolved for the identifier.");
            }
            binding = rootBindings[0];
        }

        plan = {
            identifier,
            componentCreator: this._getComponentCreator(identifier, binding, this._rootScopeInstances)
        };

        this._planCache.set(identifier, plan);
        return plan;
    }

    private _getBindings(identifier: Identifier): Binding[] {
        return this._bindingResolver(identifier);
    }

    private _getComponentCreator(identifier: Identifier, binding: Binding, scopeInstances: ScopeInstanceMap): ComponentCreator {
        this._stack.push(identifier);
        let componentCreator: ComponentCreator;
        try {
            let creator: ComponentCreator | null = this._getScopedInstance(identifier, binding, scopeInstances);
            if (!creator) {
                // If the binding is in a scope, this will register the resulting ComponentCreator with that scope.
                //  This is to support reference loops during dependency lookup.
                creator = this._createComponentCreator(identifier, binding, scopeInstances);
            }
            componentCreator = creator;
        }
        finally {
            this._stack.pop();
        }

        return componentCreator;
    }

    private _createComponentCreator(identifier: Identifier, binding: Binding, scopeInstances: ScopeInstanceMap): ComponentCreator {
        if (binding.type === "value") {
            return {
                type: "value",
                componentId: uuidv4(),
                value: binding.value
            };
        }

        switch (binding.type) {
            case "factory": {
                return this._createFactoryCreator(identifier, binding, scopeInstances);
            };
            case "constructor": {
                return this._createConstructorCreator(identifier, binding, scopeInstances);
            };
            default:
                return assertKnownBinding(binding);
        }
    }

    private _createFactoryCreator(identifier: Identifier, binding: FactoryBinding, scopeInstances: ScopeInstanceMap): FactoryComponentCreator {
        const componentCreator: ComponentCreator = {
            type: "factory",
            componentId: uuidv4(),
            factory: binding.factory
        };

        this._tryApplyScoping(identifier, binding, componentCreator, scopeInstances);

        // We cannot plan for anything inside a factory, as the user will
        //  look stuff up at resolution time.
        return componentCreator;
    }

    private _createConstructorCreator(identifier: Identifier, binding: ConstructorBindingData, scopeInstances: ScopeInstanceMap): ConstructorComponentCreator {
        const {
            ctor,
            injections
        } = binding;
        const ctorArgs: DependencyGraphNode[] = [];

        const componentCreator: ConstructorComponentCreator = {
            type: "constructor",
            componentId: uuidv4(),
            ctor,
            args: ctorArgs
        };

        // If we are part of a scope, add it before resolving the dependencies.
        //  This may allow for cyclic graphs, but that is the resolver's problem.
        // We need to add it to the current scope set, not the child scope set.
        const childScopeInstances = this._tryApplyScoping(identifier, binding, componentCreator, scopeInstances);

        // Now we can recurse and resolve our dependencies.
        for (let i = 0; i < injections.length; i++) {
            const {
                all,
                optional,
                identifier: dependencyIdentifier
            } = injections[i];

            let dependencyCreator: ComponentCreator;

            const dependencyBindings = this._getBindings(dependencyIdentifier);
            if (all) {
                if (!optional && dependencyBindings.length === 0) {
                    throw new DependencyResolutionError(
                        dependencyIdentifier,
                        this._stack,
                        `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`
                    );
                }

                // If we resolve an All, it must be an array.
                //  This is even the case when we are optional and no bindings were found.
                dependencyCreator = {
                    type: "array",
                    componentId: uuidv4(),
                    values: dependencyBindings.map(binding => ({
                        identifier: dependencyIdentifier,
                        componentCreator: this._getComponentCreator(dependencyIdentifier, binding, childScopeInstances)
                    }))
                };
            }
            else if (dependencyBindings.length === 0) {
                // No matching bindings.
                if (optional) {
                    // We are not an all / array, so the return value for optional is null.
                    dependencyCreator = {
                        type: "value",
                        componentId: uuidv4(),
                        value: null
                    };
                }

                throw new DependencyResolutionError(
                    dependencyIdentifier,
                    this._stack,
                    `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`
                );
            }
            else if (dependencyBindings.length > 1) {
                // Array case was already handled, so this means we do not know what binding to use.
                throw new DependencyResolutionError(
                    dependencyIdentifier,
                    this._stack,
                    `More than one binding was resolved for the argument at position ${i} of bound constructor "${ctor.name}".`
                );
            }
            else {
                // At this point, we have exactly 1 binding on a 1-value injection.
                dependencyCreator = this._getComponentCreator(
                    dependencyIdentifier,
                    dependencyBindings[0],
                    childScopeInstances
                );
            }

            ctorArgs.push({
                identifier: dependencyIdentifier,
                componentCreator: dependencyCreator
            });
        }

        return componentCreator;
    }

    private _getScopedInstance(identifier: Identifier, binding: Binding, scopeInstances: ScopeInstanceMap) {
        if (!isScopeableBinding(binding)) {
            // Cannot scope this binding.
            return null;
        }

        const scope = binding.createInScope;
        if (!scope) {
            // Binding is not in any scope.
            return null;
        }

        // Try to fetch the data for this scope.
        const instanceData = scopeInstances.get(scope);
        if (!instanceData) {
            throw new DependencyResolutionError(identifier, this._stack, `The resolved binding requres scope "${scopeToString(scope)}", but no child object defines this scope.`);
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
     * Try to apply scoping data to the component.
     * This checks both inScope and defineScope.
     * It will also generate a child scoping map if one is required.
     * @param identifier The identifier of the component being scoped.
     * @param binding The binding being used to form the component creator.
     * @param component The component creator.
     * @param scopeInstances The current set of scope instances.
     * @returns The set of scope instances to use for any child component creators.
     */
    private _tryApplyScoping(
        identifier: Identifier,
        binding: Binding,
        component: ComponentCreator,
        scopeInstances: ScopeInstanceMap
    ): ScopeInstanceMap {
        // Pointless binding type check to make typescript happy.
        if (binding.type === "value") {
            // Value types cannot be scoped, nor can they be within a scope.
            //  This is because we have no way of binding to a specific instance within the scope.
            return scopeInstances;
        }

        // A component that cannot be placed in a scope also cannot serve as a scope itself.
        if (!isComponentScopable(component)) {
            return scopeInstances;
        }

        const {
            createInScope,
            definesScope
        } = binding;

        // Check to see if the component is in a scope.
        if (createInScope) {
            const instanceData = scopeInstances.get(createInScope);
            if (!instanceData) {
                throw new DependencyResolutionError(
                    identifier,
                    this._stack,
                    `The resolved binding requres scope "${scopeToString(createInScope)}", but no child object defines this scope.`
                );
            }

            // The component is scoped, so add it as The Component for this specific identifier under the component.
            instanceData.instances.set(identifier, component);
            component.containingScope = createInScope;

            // We might be being defined by a special case symbol, such as SingletonSymbol.
            if (typeof instanceData.definer !== "symbol") {
                component.containingScopeInstance = instanceData.definer;
            }
        }

        // Check if the component is defining a new scope.
        if (definesScope) {
            // We are a new scope, so set up a new scope instance map that
            //  contains us.  This will be used by children.
            // We need to create a new outer map as new child scopes within a scope should only be accessible within that scope.
            //  We still need to copy the outer scopes, however.  A scope is available to all children unless overrode with another
            //  object defining the same scope.
            component.defineScope = definesScope;
            return new Map(scopeInstances).set(definesScope, {
                definer: component,
                instances: new Map()
            });
        }

        // We are not defining a new scope, so keep passing the existing scope instance map.
        return scopeInstances;
    }
}

function assertKnownBinding(b: never): never {
    throw new Error(`Encountered unknown binding type "${String((b as Binding).type)}".`);
}