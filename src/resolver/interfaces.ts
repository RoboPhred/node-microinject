
import {
    DependencyNode
} from "../planner";

/**
 * An object capable of resolving a dependency graph.
 */
export interface DependencyGraphResolver {
    /**
     * Returns a value indicating whether we are presently trying to
     * create a new instance from the given node.
     * 
     * This can be used to check if resolving the node will create
     * a circular dependency.
     * 
     * @param node The node to check if we are instantiating.
     * @returns ```true``` if the node is being resolved, or ```false```.
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
     * @param from The node to start retrieving the resolution stack at.
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
}