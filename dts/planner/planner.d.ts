import { Identifier } from "../interfaces";
import { Binding } from "../binder/binding";
import { DependencyNode } from "./interfaces";
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
    constructor(_bindingResolver: BindingResolver);
    /**
     * Gets a plan for the identifier, optionally using a specific binding.
     * @param identifier The identifier to get a plan for.
     * @param binding An optional binding to use for the identifier.  Useful if multiple bindings may apply.
     */
    getPlan(identifier: Identifier, binding?: Binding, noCache?: boolean): DependencyNode;
    private _getBindings(identifier);
    private _getDependencyNode(identifier, binding, scopeInstances);
    private _createDependencyNode(identifier, binding, scopeInstances);
    private _createFactoryNode(identifier, binding, scopeInstances);
    private _createConstructorNode(identifier, binding, scopeInstances);
    private _planInjection(injection, childScopeInstances);
    private _planAllValuesInjection(injection, childScopeInstances);
    private _planSingleValueInjection(injection, childScopeInstances);
    private _getScopedInstance(identifier, binding, scopeInstances);
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
    private _tryApplyScoping(identifier, node, scopeInstances);
}
