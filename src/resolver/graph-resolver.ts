import { Scope, SingletonScope } from "../scope";

import {
  DependencyNode,
  ScopedDependenencyNode,
  isBindingDependencyNode,
  getDependencyNodeIdentifier,
} from "../planner";

import { isScopeableBinding } from "../binder/binding";

import { identifierToString, has } from "../utils";

import { DependencyGraphResolver, ResolveOpts } from "./interfaces";

import {
  ComponentResolvers,
  defaultComponentResolvers,
} from "./component-resolver";
import { ParameterNotSuppliedError, ScopeNotFoundError } from "../errors";

/*
Scopes and GC:

An object created "in a scope" should exist for the lifetime of the object instance
that represents the scope.

The case where we need to keep knowledge of scope instances, and take a strong ref for a lookup of such,
is the case where we need to keep the ability to further create objects after we are done with
our current resolve cycle.
Right now, this only comes up with factory functions, which can receive a context to make further plans
and resolutions.

*/

function isNodeScoped(node: DependencyNode): node is ScopedDependenencyNode {
  return (
    isBindingDependencyNode(node) &&
    isScopeableBinding(node) &&
    node.createInScope != null
  );
}
function isNodeScopeCreator(
  node: DependencyNode
): node is ScopedDependenencyNode {
  return (
    isBindingDependencyNode(node) &&
    isScopeableBinding(node) &&
    node.definesScope != null
  );
}

/**
 * A basic dependency graph resolver, capable of handling scopes
 * and generating child resolvers as appropriate.
 *
 * It allows extension by constructor argument to specify
 * resolvers for constructor, factory, and value nodes.
 * All other node types are variants of these, and built up
 * using the provided resolvers.
 */
export class BasicDependencyGraphResolver implements DependencyGraphResolver {
  /**
   * The set of functions used to resolve the various component types.
   */
  private _resolvers: ComponentResolvers;

  /**
   * The stack of nodes we are currently instantiating.
   * This differs from _resolutionStack in that it only contains
   * nodes for which we are generating new instances for.
   *
   * Trying to instantiate a node already in this or parent
   * stacks indicates a circular dependency.
   */
  private _instantiationStack: DependencyNode[] = [];

  /**
   * The stack of nodes we are currently resolving.
   *
   * Trying to instantiate a node already in this or
   * parent stacks is not necessarily a circular dependency, as
   * the node instance may already have been created.
   */
  private _resolutionStack: DependencyNode[] = [];

  /**
   * The scope which we are the owner of.
   *
   * This is set internally by the parent BasicDependencyGraphResolver,
   * as typescript grumbles about using the private ScopedDependencyNode
   * in the public constructor, and re-exporting it causes trouble down the line.
   */
  private _ownedScope?: ScopedDependenencyNode | null = null;

  /**
   * The root object that created the scope this resolver is responsible for.
   */
  private _scopeRoot: any = null;

  /**
   * Map of instance IDs to their instances.
   * The instances contained in here should all be owned by our _ownedScope.
   * That is, their scopeOwnerInstance should be equal to _ownedScope.instance
   */
  private _scopedInstances: Map<string, any> = new Map();

  /**
   * The parent resolver.
   * Used to seek out the owner of scoped components so
   * we do not duplicate a scoped component in a child resolver.
   *
   * This is set internally by the parent BasicDependencyGraphResolver,
   * to keep it out of the public constructor.
   */
  private _parent?: BasicDependencyGraphResolver | null = null;

  constructor(resolvers?: Partial<ComponentResolvers>) {
    // Make sure to fill in any resolvers that the user didn't specify.
    this._resolvers = { ...defaultComponentResolvers, ...(resolvers || {}) };
  }

  /**
   * Returns a value indicating whether we are presently trying to create an
   * instance the given node.
   * @param node The node to check if we are resolving.
   * @returns ```true``` if the node is being resolved.
   */
  isInstantiating(node: DependencyNode): boolean {
    if (this._instantiationStack.indexOf(node) !== -1) {
      return true;
    }

    if (this._parent) {
      return this._parent.isInstantiating(node);
    }

    return false;
  }

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
  getResolveStack(from?: DependencyNode): DependencyNode[] {
    let stack: DependencyNode[];

    const idx = from ? this._resolutionStack.indexOf(from) : -1;
    if (idx === -1) {
      // Get the portion of the stack from the parent (if any), and add on our portion.
      const parentStack = this._parent
        ? this._parent.getResolveStack(from)
        : [];
      stack = parentStack.concat(this._resolutionStack);
    } else {
      stack = this._resolutionStack.slice(idx);
    }

    return stack;
  }

  /**
   * Resolves an instance of a node of a dependency graph.
   * Child nodes will be recursively obtained as-needed to build the object.
   * Depending on the scoping of this resolver and the scope of the node,
   * the object returned may have been pre-created.
   * @param node The dependency graph node representing the object to resolve.
   */
  resolveInstance<T = any>(node: DependencyNode, opts: ResolveOpts = {}): T {
    this._resolutionStack.push(node);
    try {
      return this._getNodeInstance(node, opts);
    } finally {
      this._resolutionStack.pop();
    }
  }

  getScopeRoot(scope: Scope): any {
    if (this._ownedScope?.definesScope === scope) {
      return this._scopeRoot;
    }

    if (this._parent) {
      return this._parent.getScopeRoot(scope);
    }

    return undefined;
  }

  private _getNodeInstance(node: DependencyNode, opts: ResolveOpts): any {
    if (isNodeScoped(node)) {
      // If the component is in a scope, we need to find the resolver that owns the scope.
      return this._getScopedNodeInstance(node, opts);
    } else {
      // Not scoped, so we do not need to try to get an existing instance.
      return this._createNodeInstance(node, opts);
    }
  }

  private _getScopedNodeInstance(
    node: ScopedDependenencyNode,
    opts: ResolveOpts
  ): any {
    if (!node.createInScope) {
      throw new Error("_getScopedNodeInstance called on non-scoped component.");
    }

    // Scoped nodes have special handling to avoid duplicating scoped nodes
    //  when requested from a child resolver.
    // We first establish that the "owner" of all instances of a node belonging
    //  to a scope is the resolver that resolved the instance which represents the scope.
    //  That is: the component is cached where component.scopeOwnerNodeId was created.

    const { nodeId, scopeOwnerNodeId } = node;

    if (node.createInScope === SingletonScope) {
      if (this._parent) {
        // singleton is handled by root resolver.
        return this._parent._getScopedNodeInstance(node, opts);
      }
      // We are root, we own it.
      //  Continue below to look up or create the instance.
    } else if (!scopeOwnerNodeId) {
      // Not a special scope, but the dependency graph didn't specify our owner instance.
      throw new Error(
        "_getScopedNodeInstance called on a scoped component without a scopeOwnerNodeId."
      );
    } else if (
      !this._ownedScope ||
      scopeOwnerNodeId !== this._ownedScope.nodeId
    ) {
      // We do not own this instance, check the parent.
      if (!this._parent) {
        // This should never happen, so long as resolvers are always used and their owned scopes
        //  or ancestor setup is never messed with.
        throw new Error(
          `Could not find owner for scoped component "${identifierToString(
            node.identifier
          )}".`
        );
      }
      return this._parent._getScopedNodeInstance(node, opts);
    }

    // At this point, we are the owner of the node.
    // We need to check for, create, and cache the instance.
    // We still have to use .has() when looking for the instance,
    //  as its possible to store null or undefined as a scoped
    //  value through a factory binding.
    if (this._scopedInstances.has(nodeId)) {
      return this._scopedInstances.get(nodeId);
    }

    // Did not create it yet.  Create it.
    //  Store the instance from the register callback, so
    //  it is available to postInstantiate
    const instance = this._createNodeInstance(node, opts, (instance) =>
      this._scopedInstances.set(nodeId, instance)
    );

    return instance;
  }

  private _createNodeInstance(
    node: DependencyNode,
    opts: ResolveOpts,
    register?: (instance: any) => void
  ): any {
    let instance: any;
    let resolver: BasicDependencyGraphResolver;

    if (isNodeScopeCreator(node)) {
      if (this._ownedScope && node.nodeId === this._ownedScope.nodeId) {
        if (this._scopeRoot !== null) {
          throw new Error(
            "BasicDependencyGraphResolver tried to re-initialize its owned scope instance."
          );
        }
        // We are creating the node which we represent as the scope.
        instance = this._instantiateOwnedNodeInstance(node, opts);
        resolver = this;
        this._scopeRoot = instance;
      } else {
        // If the node is defining a new scope which we do not own,
        //  we need to create a child resolver to hold the instances scoped to it.
        //  Be sure to specify the scope owner node.
        resolver = this._createChildResolver(node);

        // We are certain that we want to create a new node, rather than resolving
        //  an existing one.
        instance = resolver._createNodeInstance(node, opts);
      }
    } else {
      // Not defining a scope, or we own the scope.  No special handling.
      instance = this._instantiateOwnedNodeInstance(node, opts);
      resolver = this;
    }

    if (register) {
      register(instance);
    }

    this._postInstantiateNode(node, resolver, instance, opts);

    return instance;
  }

  private _postInstantiateNode(
    node: DependencyNode,
    resolver: DependencyGraphResolver,
    instance: any,
    opts: ResolveOpts
  ): void {
    if (this._resolvers.postInstantiate) {
      this._resolvers.postInstantiate(
        node,
        resolver,
        instance,
        opts.parameters ?? {}
      );
    }
  }

  private _instantiateOwnedNodeInstance(
    node: DependencyNode,
    opts: ResolveOpts
  ): any {
    this._instantiationStack.push(node);
    try {
      switch (node.type) {
        case "constructor":
          return this._resolvers.ctor(node, this, opts);
        case "factory":
          return this._resolvers.factory(node, this, opts);
        case "value":
          // We still allow external resolution of simple values.
          //  This is for wrapping, proxying, monkey-patching, and other such cross-cutting tomfoolery.
          return this._resolvers.const(node, this, opts);
        case "param": {
          const params = opts.parameters ?? {};
          if (!has(params, node.paramKey)) {
            if (node.optional) {
              return null;
            }
            throw new ParameterNotSuppliedError(
              node.paramKey,
              this.getResolveStack().map(getDependencyNodeIdentifier)
            );
          }
          return params[node.paramKey as any];
        }
        case "scope": {
          const scope = this.getScopeRoot(node.scope);
          if (scope === undefined) {
            throw new ScopeNotFoundError(
              node.scope,
              this.getResolveStack(node).map(getDependencyNodeIdentifier),
              "The requested scope was not found."
            );
          }
          return scope;
        }
        case "parent":
          return this._resolvers.parentIdentifier(node, opts);
        default:
          return throwUnknownNodeType(node);
      }
    } finally {
      this._instantiationStack.pop();
    }
  }

  private _createChildResolver(
    scopeOwner?: ScopedDependenencyNode
  ): BasicDependencyGraphResolver {
    const resolver = new BasicDependencyGraphResolver(this._resolvers);
    resolver._ownedScope = scopeOwner || null;
    resolver._parent = this;
    return resolver;
  }
}

function throwUnknownNodeType(c: never): never {
  throw new Error(`Unknown node type "${(c as DependencyNode).type}".`);
}
