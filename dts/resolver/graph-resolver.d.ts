import { DependencyNode } from "../planner";
import { DependencyGraphResolver } from "./interfaces";
import { ComponentResolvers } from "./component-resolver";
/**
 * A basic dependency graph resolver, capable of handling scopes
 * and generating child resolvers as appropriate.
 *
 * It allows extension by constructor argument to specify
 * resolvers for constructor, factory, and value nodes.
 * All other node types are variants of these, and built up
 * using the provided resolvers.
 */
export declare class BasicDependencyGraphResolver implements DependencyGraphResolver {
    /**
     * The set of functions used to resolve the various component types.
     */
    private _resolvers;
    /**
     * The stack of nodes we are currently instantiating.
     * This differs from _resolutionStack in that it only contains
     * nodes for which we are generating new instances for.
     *
     * Trying to instantiate a node already in this or parent
     * stacks indicates a circular dependency.
     */
    private _instantiationStack;
    /**
     * The stack of nodes we are currently resolving.
     *
     * Trying to instantiate a node already in this or
     * parent stacks is not necessarily a circular dependency, as
     * the node instance may already have been created.
     */
    private _resolutionStack;
    /**
     * Map of instance IDs to their instances.
     * The instances contained in here should all be owned by our _ownedScope.
     * That is, their scopeOwnerInstance should be equal to _ownedScope.instance
     */
    private _scopedInstances;
    /**
     * The parent resolver.
     * Used to seek out the owner of scoped components so
     * we do not duplicate a scoped component in a child resolver.
     *
     * This is set internally by the parent BasicDependencyGraphResolver,
     * to keep it out of the public constructor.
     */
    private _parent?;
    /**
     * The scope which we are the owner of.
     *
     * This is set internally by the parent BasicDependencyGraphResolver,
     * as typescript grumbles about using the private ScopedDependencyNode
     * in the public constructor, and re-exporting it causes trouble down the line.
     */
    private _ownedScope?;
    constructor(resolvers?: Partial<ComponentResolvers>);
    /**
     * Returns a value indicating whether we are presently trying to create an
     * instance the given node.
     * @param node The node to check if we are resolving.
     * @returns ```true``` if the node is being resolved.
     */
    isInstantiating(node: DependencyNode): boolean;
    /**
     * Gets an array of nodes describing the stack of resolutions made
     * from the given node up to the current resolving node.
     * If no node is given, the entire resolve stack is returned.
     *
     * The primary purpose of this function is for diagnostic
     * tracing, particularly when a circular dependency is found.
     *
     * This function cannot be used to detect circular dependencies,
     * as returned nodes may be in the property resolution stage.
     *
     * @param from The node to start retrieving the resolution stack at.
     * @see isInstantiating
     */
    getResolveStack(from?: DependencyNode): DependencyNode[];
    /**
     * Resolves an instance of a node of a dependency graph.
     * Child nodes will be recursively obtained as-needed to build the object.
     * Depending on the scoping of this resolver and the scope of the node,
     * the object returned may have been pre-created.
     * @param node The dependency graph node representing the object to resolve.
     */
    resolveInstance<T = any>(node: DependencyNode): T;
    private _getNodeInstance;
    private _getScopedNodeInstance;
    private _createNodeInstance;
    private _postInstantiateNode;
    private _instantiateOwnedNodeInstance;
    private _createChildResolver;
}
