import { Identifier } from "../interfaces";
import { Binding } from "../binder/binding";
import { DependencyNode, ScopeInstanceMap } from "./interfaces";
export declare type BindingResolver = (identifier: Identifier) => Binding[];
export declare class DependencyGraphPlanner {
    private _bindingResolver;
    /**
     * Maps binding IDs to their plan cache.
     */
    private _planCache;
    /**
     * The current stack of identifiers being planned.
     */
    private _stack;
    /**
     * A map of scopes to scope instance data.
     */
    private _rootScopeInstances;
    constructor(_bindingResolver: BindingResolver, initialStack?: Identifier[], scopeInstances?: ScopeInstanceMap);
    /**
     * Gets a plan for the identifier, optionally using a specific binding.
     * @param identifier The identifier to get a plan for.
     * @param binding An optional binding to use for the identifier.  Useful if multiple bindings may apply.
     */
    getPlan(identifier: Identifier, binding?: Binding, noCache?: boolean): DependencyNode;
    private _getBindings;
    private _getDependencyNode;
    private _createDependencyNode;
    private _createFactoryNode;
    private _createConstructorNode;
    private _planInjection;
    private _planAllValuesInjection;
    private _planSingleValueInjection;
    private _getScopedInstance;
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
    private _tryApplyScoping;
}
