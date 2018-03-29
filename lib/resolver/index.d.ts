import { Identifier } from "../interfaces";
import { DependencyGraphNode, FactoryComponentCreator, ConstructorComponentCreator, ValueComponentCreator } from "../planner";
export interface DependencyResolvers {
    factory: (identifier: Identifier, creator: FactoryComponentCreator, childResolver: DependencyGraphResolver) => any;
    ctor: (identifier: Identifier, creator: ConstructorComponentCreator, childResolver: DependencyGraphResolver) => any;
    value: (identifier: Identifier, creator: ValueComponentCreator, childResolver: DependencyGraphResolver) => any;
}
export default class DependencyGraphResolver {
    private _ownedScope;
    /**
     * The set of functions used to resolve the various component types.
     */
    private _resolvers;
    /**
     * The stack of identifiers of the instantiations we are currently processing.
     * This should always contain all identifiers of _instantiationSet.values().map(x => identifier)
     */
    private _instantiationStack;
    /**
     * A map of all ongoing instantiations.
     * Maps the ComponentCreator of the instantiation to the node that caused it to begin.
     */
    private _instantiationSet;
    /**
     * Components scoped to scope definers specified in our _ownedScopes.
     */
    private _scopedComponents;
    /**
     * The parent resolver.
     * Used to seek out the owner of scoped components so
     * we do not duplicate a scoped component in a child resolver.
     *
     * This is set on the child by the parent, to keep it out of the public constructor.
     */
    private _parent?;
    constructor(resolvers?: Partial<DependencyResolvers>, _ownedScope?: FactoryComponentCreator | ConstructorComponentCreator | undefined);
    /**
     * Returns a value indicating whether we are presently trying to resolve
     * the value of the given node.
     * This indicates that somewhere in our call stack is a call to resolveInstance(node).
     * @param node The node to check if we are resolving.
     * @returns ```true``` if the node is being resolved.
     */
    isResolving(node: DependencyGraphNode): boolean;
    /**
     * Gets an array of Identifiers indicating the stack of resolutions made
     * from the given node up to the current resolving node.
     * If no node is given, the entire resolve stack is returned.
     *
     * The primary purpose of this function is to get a
     * diagnostic trace of the resolution path, particularly
     * when a circular dependency is found.
     *
     * @param from The node to start retrieving the resolution stack at.
     */
    getResolveStack(from?: DependencyGraphNode): Identifier[];
    resolveInstance<T = any>(node: DependencyGraphNode): T;
    private _getNodeComponent(node);
    private _getScopedNodeComponent(node);
    private _createNodeComponent(node);
    private _createScopeRootNodeComponent(node);
    private _createLocalNodeComponent(node);
    private _createChildResolver();
}
