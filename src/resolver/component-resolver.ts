import { Identifier } from "../interfaces";

import {
  ConstDependencyNode,
  ConstructorDependencyNode,
  DependencyNode,
  FactoryDependencyNode,
  InjectedValue
} from "../planner";

import { DependencyResolutionError } from "../errors";

import { DependencyGraphResolver } from "./interfaces";

export interface ComponentResolvers {
  /**
   * Resolve a constant value from a dependency node.
   * @param identifier The identifier being resolved.
   * @param creator The dependency node describing the resolution.
   * @param childResolver A dependency resolver scoped to children of this resolved node.
   */
  const(
    identifier: Identifier,
    creator: ConstDependencyNode,
    childResolver: DependencyGraphResolver
  ): any;

  /**
   * Resolve a factory-created value from a dependency node.
   * @param identifier The identifier being resolved.
   * @param creator The dependency node describing the resolution.
   * @param childResolver A dependency resolver scoped to children of this resolved node.
   */
  factory(
    identifier: Identifier,
    creator: FactoryDependencyNode,
    childResolver: DependencyGraphResolver
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
   * It is advisable to deferr prop injection resolution until postInstantiate,
   * as we are able to resolve values for properties that might refer to us in their
   * constructor injections.  This is a common way of handling circular dependencies.
   *
   * @param identifier The identifier being resolved.
   * @param creator The dependency node describing the resolution.
   * @param childResolver A dependency resolver scoped to children of this resolved node.
   * @see postInstantiate
   */
  ctor(
    identifier: Identifier,
    creator: ConstructorDependencyNode,
    childResolver: DependencyGraphResolver
  ): any;

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
   * @param creator The dependency node describing the resolution.
   * @param childResolver A dependency resolver scoped to children of this resolved node.
   * @see ctorProps
   */
  postInstantiate?(
    identifier: Identifier,
    creator: DependencyNode,
    resolver: DependencyGraphResolver,
    instance: object
  ): any;
}

export const defaultComponentResolvers: ComponentResolvers = {
  const(_identifier, creator, _childResolver) {
    return creator.value;
  },
  factory(_identifier, creator, _childResolver) {
    // Stub out Context.
    //  Cannot make a context or resolve plans without
    //  knowing our container or planner.
    // Previously, we treated factory as a function with arbitrary
    //  arguments, but now that FactoryDependencyNode pulls in
    //  FactoryBinding, we are contracted to the Context argument.
    return creator.factory({
      get container(): any {
        throw new Error("Property not implemented.");
      },
      has() {
        throw new Error("Method not implemented.");
      },
      get() {
        throw new Error("Method not implemented.");
      },
      getAll() {
        throw new Error("Method not implemented.");
      }
    });
  },
  ctor(identifier, creator, childResolver) {
    const args = creator.ctorInjectionNodes.map(inj =>
      resolveInjectedArg(childResolver, inj)
    );
    return new creator.ctor(...args);
  },
  postInstantiate(
    identifier: Identifier,
    creator: DependencyNode,
    resolver: DependencyGraphResolver,
    instance: any
  ): any {
    if (creator.type === "constructor") {
      for (let [propName, injection] of creator.propInjectionNodes) {
        const injectedValue = resolveInjectedArg(resolver, injection);
        instance[propName] = injectedValue;
      }
    }
  }
};

function resolveInjectionInstance(
  resolver: DependencyGraphResolver,
  node: DependencyNode
): any {
  if (resolver.isInstantiating(node)) {
    throwCyclicDependency(node.identifier, resolver);
  }
  return resolver.resolveInstance(node);
}

function resolveInjectedArg(
  resolver: DependencyGraphResolver,
  injection: InjectedValue
): any {
  if (injection == null) {
    return null;
  } else if (Array.isArray(injection)) {
    return injection.map(inj => resolveInjectionInstance(resolver, inj));
  } else {
    return resolveInjectionInstance(resolver, injection);
  }
}

function throwCyclicDependency(
  cyclicIdentifier: Identifier,
  childResolver: DependencyGraphResolver
): never {
  const identifierStack = childResolver
    .getResolveStack()
    .map(x => x.identifier);
  identifierStack.push(cyclicIdentifier);
  throw new DependencyResolutionError(
    cyclicIdentifier,
    identifierStack,
    `Cannot resolve cyclic dependency.`
  );
}
