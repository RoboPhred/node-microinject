
import { v4 as uuidv4 } from "uuid";

import {
    Identifier
} from "../interfaces";

import {
    Scope,
    SingletonScope
} from "../scope";

import {
    Binding,
    ConstructorBinding,
    FactoryBinding,
    isScopeableBinding
} from "../binder/binding";

import {
    scopeToString
} from "../utils";

import {
    DependencyResolutionError
} from "../errors";

import {
    ConstructorDependencyNode,
    DependencyNode,
    FactoryDependencyNode,
    InjectedArgumentValue,
    ScopedDependenencyNode
} from "./interfaces";

import {
    isScopedDependencyNode
} from "./utils";


type ScopeDefiner = ScopedDependenencyNode | symbol;

interface ScopeInstance {
    /**
     * The ComponentCreator that defined this scope.
     * 
     * May be SingletonSymbol as a special case for singleton-scoped services.
     */
    definer: ScopeDefiner;

    /**
     * Instances of scopable component creators that are in this scope.
     */
    instances: Map<Identifier, ScopedDependenencyNode>;
}
type ScopeInstanceMap = Map<Scope, ScopeInstance>;

export type BindingResolver = (identifier: Identifier) => Binding[];

export class DependencyGraphPlanner {
    private _planCache = new Map<Identifier, DependencyNode>();

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
    getPlan(identifier: Identifier, binding?: Binding): DependencyNode {
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

        const dependencyNode = this._getDependencyNode(identifier, binding, this._rootScopeInstances);

        this._planCache.set(identifier, dependencyNode);
        return dependencyNode;
    }

    private _getBindings(identifier: Identifier): Binding[] {
        return this._bindingResolver(identifier);
    }

    private _getDependencyNode(
        identifier: Identifier,
        binding: Binding,
        scopeInstances: ScopeInstanceMap
    ): DependencyNode {
        this._stack.push(identifier);
        let dependencyNode: DependencyNode;
        try {
            let node: DependencyNode | null = this._getScopedInstance(identifier, binding, scopeInstances);
            if (!node) {
                // If the binding is in a scope, this will register the resulting ComponentCreator with that scope.
                //  This is to support reference loops during dependency lookup.
                node = this._createDependencyNode(identifier, binding, scopeInstances);
            }
            dependencyNode = node;
        }
        finally {
            this._stack.pop();
        }

        return dependencyNode;
    }

    private _createDependencyNode(
        identifier: Identifier,
        binding: Binding,
        scopeInstances: ScopeInstanceMap
    ): DependencyNode {
        if (binding.type === "value") {
            return {
                ...binding,
                identifier,
                instanceId: uuidv4(),
            };
        }

        switch (binding.type) {
            case "factory": {
                return this._createFactoryNode(identifier, binding, scopeInstances);
            }
            case "constructor": {
                return this._createConstructorNode(identifier, binding, scopeInstances);
            }
            default:
                return assertKnownBinding(binding);
        }
    }

    private _createFactoryNode(
        identifier: Identifier,
        binding: FactoryBinding,
        scopeInstances: ScopeInstanceMap
    ): FactoryDependencyNode {
        const node: FactoryDependencyNode = {
            ...binding,
            identifier,
            instanceId: uuidv4(),
        };

        this._tryApplyScoping(identifier, binding, node, scopeInstances);

        // We cannot plan for anything inside a factory, as the user will
        //  look stuff up at resolution time.
        return node;
    }

    private _createConstructorNode(
        identifier: Identifier,
        binding: ConstructorBinding,
        scopeInstances: ScopeInstanceMap
    ): ConstructorDependencyNode {
        const {
            ctor,
            injections
        } = binding;

        const injectionNodes: InjectedArgumentValue[] = [];

        const node: ConstructorDependencyNode = {
            ...binding,
            identifier,
            instanceId: uuidv4(),
            ctor,
            injectionNodes
        };

        // If we are part of a scope, add it before resolving the dependencies.
        //  This may allow for cyclic graphs, but that is the resolver's problem.
        // We need to add it to the current scope set, not the child scope set.
        const childScopeInstances = this._tryApplyScoping(
            identifier,
            binding,
            node,
            scopeInstances
        );

        // Now we can recurse and resolve our dependencies.
        for (let i = 0; i < injections.length; i++) {
            // Cannot use 'of', we need the index for error messages.
            const injection = injections[i];
            const {
                all,
                optional,
                identifier: dependencyIdentifier
            } = injection;

            let nodes: InjectedArgumentValue;

            const dependencyBindings = this._getBindings(dependencyIdentifier);

            if (all) {
                if (!optional && dependencyBindings.length === 0) {
                    throw new DependencyResolutionError(
                        dependencyIdentifier,
                        this._stack,
                        `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`
                    );
                }

                nodes = dependencyBindings.map(dependencyBinding =>
                    this._getDependencyNode(dependencyIdentifier, dependencyBinding, childScopeInstances)
                );
            }
            else if (dependencyBindings.length === 0) {
                // No matching bindings.
                if (optional) {
                    // We are not an all / array, so the return value for optional is null.
                    nodes = null;
                }
                else {
                    throw new DependencyResolutionError(
                        dependencyIdentifier,
                        this._stack,
                        `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`
                    );
                }
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
                nodes = this._getDependencyNode(
                    dependencyIdentifier,
                    dependencyBindings[0],
                    childScopeInstances
                );
            }

            injectionNodes.push(nodes);
        }

        return node;
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
            throw new DependencyResolutionError(identifier, this._stack, `The resolved binding requires scope "${scopeToString(scope)}", but no child object defines this scope.`);
        }

        const instances = instanceData.instances;

        // Being created in a scope, check to see if there is already an
        //  instance of us in this scope.
        // Check instance by bindingId, as multiple identifiers
        //  may be aliases of a scoped binding.
        if (instances.has(binding.bindingId)) {
            return instances.get(binding.bindingId)!;
        }

        return null;
    }

    /**
     * Try to apply scoping data to the dependency node.
     * This checks for and applies both createInScope and definesScope.
     * It will also generate a child scoping map if one is required.
     * @param identifier The identifier of the component being scoped.
     * @param binding The binding being used to form the dependency node.
     * @param node The dependency node to apply scoping to.
     * @param scopeInstances The current set of scope instances.
     * @returns The set of scope instances to use for any child nodes.
     */
    private _tryApplyScoping(
        identifier: Identifier,
        binding: Binding,
        node: DependencyNode,
        scopeInstances: ScopeInstanceMap
    ): ScopeInstanceMap {
        // Pointless binding type check to make typescript happy.
        if (binding.type === "value") {
            // Value types cannot be scoped, nor can they be within a scope.
            //  This is because we have no way of binding to a specific instance within the scope.
            return scopeInstances;
        }

        // A node that cannot be placed in a scope also cannot serve as a scope.
        if (!isScopedDependencyNode(node)) {
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

            // The newly created node is scoped, so record it as being
            //  the specific node for the identifier in this scope instance.
            // Set instance by bindingId, as multiple identifiers
            //  may be aliases of a scoped binding.
            instanceData.instances.set(binding.bindingId, node);

            // We might be being defined by a special case symbol, such as SingletonSymbol.
            if (typeof instanceData.definer !== "symbol") {
                node.scopeOwnerInstanceId = instanceData.definer.instanceId;
            }
        }

        // Check if the component is defining a new scope.
        if (definesScope) {
            // We are a new scope, so set up a new scope instance map that
            //  contains us.  This will be used by children.
            // We need to create a new outer map as new child scopes within a scope should only be accessible within that scope.
            //  We still need to copy the outer scopes, however.  A scope is available to all children unless overrode with another
            //  object defining the same scope.
            return new Map(scopeInstances).set(definesScope, {
                definer: node,
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