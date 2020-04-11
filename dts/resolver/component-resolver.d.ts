import { ConstDependencyNode, ConstructorDependencyNode, DependencyNode, FactoryDependencyNode, ParentDependencyNode } from "../planner";
import { DependencyGraphResolver, ResolveOpts } from "./interfaces";
export interface ComponentResolvers {
    /**
     * Resolve a constant value from a dependency node.
     * @param identifier The identifier being resolved.
     * @param node The dependency node describing the resolution.
     * @param childResolver A dependency resolver scoped to children of this resolved node.
     */
    const(node: ConstDependencyNode, childResolver: DependencyGraphResolver, opts: ResolveOpts): any;
    /**
     * Resolve a factory-created value from a dependency node.
     * @param node The dependency node describing the resolution.
     * @param childResolver A dependency resolver scoped to children of this resolved node.
     */
    factory(node: FactoryDependencyNode, childResolver: DependencyGraphResolver, opts: ResolveOpts): any;
    /**
     * Instantiate or resolve a constructor from a dependency node.
     *
     * The constructor argument injections are stored in creator.ctorInjectionNodes.
     * The object property injections are stored in creator.propInjectionNodes.
     *
     * It is the responsibility of this function to check childResolver
     * for potential circular dependencies.  If a circular dependency is not handled,
     * a stack overflow will occur.
     *
     * It is advisable to deferr prop injection resolution until postInstantiate,
     * as we are able to resolve values for properties that might refer to us in their
     * constructor injections.  This is a common way of handling circular dependencies.
     *
     * @param node The dependency node describing the resolution.
     * @param childResolver A dependency resolver scoped to children of this resolved node.
     * @see postInstantiate
     */
    ctor(node: ConstructorDependencyNode, childResolver: DependencyGraphResolver, opts: ResolveOpts): any;
    /**
     * Resolves an identifier that comes from the parent container.
     * @param node The dependency node describing the resolution.
     * @param opts
     */
    parentIdentifier(node: ParentDependencyNode, opts: ResolveOpts): any;
    /**
     * Handle post-instantiation tasks for the resolved dependency node instance.
     *
     * This can be used to perform resolutions that might result in circular
     * dependencies during instantiation.
     *
     * If ctor is directly creating instances, then this is the recommended place
     * to resolve its property injections.
     *
     * @param identifier The identifier being resolved.
     * @param node The dependency node describing the resolution.
     * @param childResolver A dependency resolver scoped to children of this resolved node.
     * @see ctorProps
     */
    postInstantiate?(node: DependencyNode, resolver: DependencyGraphResolver, instance: object, opts: ResolveOpts): any;
}
export declare const defaultComponentResolvers: ComponentResolvers;
