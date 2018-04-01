import { Identifier } from "../interfaces";
import { BindingMap, BindingData } from "../binder/data";
import { BinderImpl } from "../binder/binder-impl";
import { DependencyGraphNode } from "./interfaces";
export declare class DependencyGraphPlanner {
    /**
     * Bindings keyed by identifiers.
     */
    private _bindingsForIdentifier;
    private _planCache;
    /**
     * The current stack of identifiers being planned.
     */
    private _stack;
    /**
     * A map of scopes to scope instance data.
     */
    private _rootScopeInstances;
    constructor(bindings?: BindingMap);
    addBinding(identifier: Identifier, binding: BinderImpl | BinderImpl[]): void;
    getBindings(identifier: Identifier): BindingData[];
    hasBinding(identifier: Identifier): boolean;
    /**
     * Gets a plan for the identifier, optionally using a specific binding.
     * @param identifier The identifier to get a plan for.
     * @param binding An optional binding to use for the identifier.  Useful if multiple bindings may apply.
     */
    getPlan(identifier: Identifier, binding?: BindingData): DependencyGraphNode;
    private _getComponentCreator(identifier, binding, scopeInstances);
    private _createComponentCreator(identifier, binding, scopeInstances);
    private _createFactoryCreator(identifier, binding, scopeInstances);
    private _createConstructorCreator(identifier, binding, scopeInstances);
    private _getScopedInstance(identifier, binding, scopeInstances);
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
    private _tryApplyScoping(identifier, binding, component, scopeInstances);
}
