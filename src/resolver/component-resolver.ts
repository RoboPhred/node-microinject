import { Identifier } from "../interfaces";

import {
  ConstDependencyNode,
  ConstructorDependencyNode,
  DependencyNode,
  FactoryDependencyNode,
  InjectedValue,
  BindingDependencyNode,
  getDependencyNodeIdentifier,
  ParentDependencyNode,
} from "../planner";

import { DependencyResolutionError } from "../errors";

import { DependencyGraphResolver, ResolveOpts } from "./interfaces";

export interface ComponentResolvers {
  /**
   * Resolve a constant value from a dependency node.
   * @param identifier The identifier being resolved.
   * @param node The dependency node describing the resolution.
   * @param childResolver A dependency resolver scoped to children of this resolved node.
   */
  const(
    node: ConstDependencyNode,
    childResolver: DependencyGraphResolver,
    opts: ResolveOpts
  ): any;

  /**
   * Resolve a factory-created value from a dependency node.
   * @param node The dependency node describing the resolution.
   * @param childResolver A dependency resolver scoped to children of this resolved node.
   */
  factory(
    node: FactoryDependencyNode,
    childResolver: DependencyGraphResolver,
    opts: ResolveOpts
  ): any;

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
   * It is advisable to defer prop injection resolution until postInstantiate,
   * as we are able to resolve values for properties that might refer to us in their
   * constructor injections.  This is a common way of handling circular dependencies.
   *
   * @param node The dependency node describing the resolution.
   * @param childResolver A dependency resolver scoped to children of this resolved node.
   * @see postInstantiate
   */
  ctor(
    node: ConstructorDependencyNode,
    childResolver: DependencyGraphResolver,
    opts: ResolveOpts
  ): any;

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
   * @see ctor
   */
  postInstantiate?(
    node: DependencyNode,
    resolver: DependencyGraphResolver,
    instance: object,
    opts: ResolveOpts
  ): any;
}

export const defaultComponentResolvers: ComponentResolvers = {
  const(node, _childResolver) {
    return node.value;
  },
  factory(node, _childResolver) {
    // Stub out Context.
    //  Cannot make a context or resolve plans without
    //  knowing our container or planner.
    // Previously, we treated factory as a function with arbitrary
    //  arguments, but now that FactoryDependencyNode pulls in
    //  FactoryBinding, we are contracted to the Context argument.
    return node.factory({
      get container(): any {
        throw new Error("Property not implemented.");
      },
      get parameters(): any {
        return Object.seal({});
      },
      create() {
        throw new Error("Method not implemented.");
      },
      has() {
        throw new Error("Method not implemented.");
      },
      get() {
        throw new Error("Method not implemented.");
      },
      getAll() {
        throw new Error("Method not implemented.");
      },
    });
  },
  ctor(node, childResolver, opts) {
    const args = node.ctorInjectionNodes.map((inj) =>
      resolveInjectedArg(childResolver, inj, opts)
    );
    return new node.ctor(...args);
  },
  parentIdentifier(node, opts) {
    throw new Error("Method not implemented.");
  },
  postInstantiate(
    creator: DependencyNode,
    resolver: DependencyGraphResolver,
    instance: any,
    opts: ResolveOpts
  ): any {
    if (creator.type === "constructor") {
      for (let [propName, injection] of creator.propInjectionNodes) {
        const injectedValue = resolveInjectedArg(resolver, injection, opts);
        instance[propName] = injectedValue;
      }
    }
  },
};

function resolveInjectionInstance(
  resolver: DependencyGraphResolver,
  node: DependencyNode,
  opts: ResolveOpts
): any {
  if (resolver.isInstantiating(node)) {
    // Only identifier nodes can cause cyclinc dependencies.
    throwCyclicDependency((node as BindingDependencyNode).identifier, resolver);
  }
  return resolver.resolveInstance(node, opts);
}

function resolveInjectedArg(
  resolver: DependencyGraphResolver,
  injection: InjectedValue,
  opts: ResolveOpts
): any {
  if (injection == null) {
    return null;
  } else if (Array.isArray(injection)) {
    return injection.map((inj) =>
      resolveInjectionInstance(resolver, inj, opts)
    );
  } else {
    return resolveInjectionInstance(resolver, injection, opts);
  }
}

function throwCyclicDependency(
  cyclicIdentifier: Identifier,
  childResolver: DependencyGraphResolver
): never {
  const identifierStack = childResolver
    .getResolveStack()
    .map(getDependencyNodeIdentifier);
  identifierStack.push(cyclicIdentifier);
  throw new DependencyResolutionError(
    cyclicIdentifier,
    identifierStack,
    `Cannot resolve cyclic dependency.`
  );
}
