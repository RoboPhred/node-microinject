"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../scope");
const planner_1 = require("../planner");
const binding_1 = require("../binder/binding");
const utils_1 = require("../utils");
const component_resolver_1 = require("./component-resolver");
const errors_1 = require("../errors");
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
function isNodeScoped(node) {
    return (planner_1.isBindingDependencyNode(node) &&
        binding_1.isScopeableBinding(node) &&
        node.createInScope != null);
}
function isNodeScopeCreator(node) {
    return (planner_1.isBindingDependencyNode(node) &&
        binding_1.isScopeableBinding(node) &&
        node.definesScope != null);
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
class BasicDependencyGraphResolver {
    constructor(resolvers) {
        /**
         * The stack of nodes we are currently instantiating.
         * This differs from _resolutionStack in that it only contains
         * nodes for which we are generating new instances for.
         *
         * Trying to instantiate a node already in this or parent
         * stacks indicates a circular dependency.
         */
        this._instantiationStack = [];
        /**
         * The stack of nodes we are currently resolving.
         *
         * Trying to instantiate a node already in this or
         * parent stacks is not necessarily a circular dependency, as
         * the node instance may already have been created.
         */
        this._resolutionStack = [];
        /**
         * The scope which we are the owner of.
         *
         * This is set internally by the parent BasicDependencyGraphResolver,
         * as typescript grumbles about using the private ScopedDependencyNode
         * in the public constructor, and re-exporting it causes trouble down the line.
         */
        this._ownedScope = null;
        /**
         * The root object that created the scope this resolver is responsible for.
         */
        this._scopeRoot = null;
        /**
         * Map of instance IDs to their instances.
         * The instances contained in here should all be owned by our _ownedScope.
         * That is, their scopeOwnerInstance should be equal to _ownedScope.instance
         */
        this._scopedInstances = new Map();
        /**
         * The parent resolver.
         * Used to seek out the owner of scoped components so
         * we do not duplicate a scoped component in a child resolver.
         *
         * This is set internally by the parent BasicDependencyGraphResolver,
         * to keep it out of the public constructor.
         */
        this._parent = null;
        // Make sure to fill in any resolvers that the user didn't specify.
        this._resolvers = Object.assign(Object.assign({}, component_resolver_1.defaultComponentResolvers), (resolvers || {}));
    }
    /**
     * Returns a value indicating whether we are presently trying to create an
     * instance the given node.
     * @param node The node to check if we are resolving.
     * @returns ```true``` if the node is being resolved.
     */
    isInstantiating(node) {
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
    getResolveStack(from) {
        let stack;
        const idx = from ? this._resolutionStack.indexOf(from) : -1;
        if (idx === -1) {
            // Get the portion of the stack from the parent (if any), and add on our portion.
            const parentStack = this._parent
                ? this._parent.getResolveStack(from)
                : [];
            stack = parentStack.concat(this._resolutionStack);
        }
        else {
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
    resolveInstance(node, opts = {}) {
        this._resolutionStack.push(node);
        try {
            return this._getNodeInstance(node, opts);
        }
        finally {
            this._resolutionStack.pop();
        }
    }
    getScopeRoot(scope) {
        var _a;
        if (((_a = this._ownedScope) === null || _a === void 0 ? void 0 : _a.definesScope) === scope) {
            return this._scopeRoot;
        }
        if (this._parent) {
            return this._parent.getScopeRoot(scope);
        }
        return undefined;
    }
    _getNodeInstance(node, opts) {
        if (isNodeScoped(node)) {
            // If the component is in a scope, we need to find the resolver that owns the scope.
            return this._getScopedNodeInstance(node, opts);
        }
        else {
            // Not scoped, so we do not need to try to get an existing instance.
            return this._createNodeInstance(node, opts);
        }
    }
    _getScopedNodeInstance(node, opts) {
        if (!node.createInScope) {
            throw new Error("_getScopedNodeInstance called on non-scoped component.");
        }
        // Scoped nodes have special handling to avoid duplicating scoped nodes
        //  when requested from a child resolver.
        // We first establish that the "owner" of all instances of a node belonging
        //  to a scope is the resolver that resolved the instance which represents the scope.
        //  That is: the component is cached where component.scopeOwnerNodeId was created.
        const { nodeId, scopeOwnerNodeId } = node;
        if (node.createInScope === scope_1.SingletonScope) {
            if (this._parent) {
                // singleton is handled by root resolver.
                return this._parent._getScopedNodeInstance(node, opts);
            }
            // We are root, we own it.
            //  Continue below to look up or create the instance.
        }
        else if (!scopeOwnerNodeId) {
            // Not a special scope, but the dependency graph didn't specify our owner instance.
            throw new Error("_getScopedNodeInstance called on a scoped component without a scopeOwnerNodeId.");
        }
        else if (!this._ownedScope ||
            scopeOwnerNodeId !== this._ownedScope.nodeId) {
            // We do not own this instance, check the parent.
            if (!this._parent) {
                // This should never happen, so long as resolvers are always used and their owned scopes
                //  or ancestor setup is never messed with.
                throw new Error(`Could not find owner for scoped component "${utils_1.identifierToString(node.identifier)}".`);
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
        const instance = this._createNodeInstance(node, opts, (instance) => this._scopedInstances.set(nodeId, instance));
        return instance;
    }
    _createNodeInstance(node, opts, register) {
        let instance;
        let resolver;
        if (isNodeScopeCreator(node)) {
            if (this._ownedScope && node.nodeId === this._ownedScope.nodeId) {
                if (this._scopeRoot !== null) {
                    throw new Error("BasicDependencyGraphResolver tried to re-initialize its owned scope instance.");
                }
                // We are creating the node which we represent as the scope.
                instance = this._instantiateOwnedNodeInstance(node, opts);
                resolver = this;
                this._scopeRoot = instance;
            }
            else {
                // If the node is defining a new scope which we do not own,
                //  we need to create a child resolver to hold the instances scoped to it.
                //  Be sure to specify the scope owner node.
                resolver = this._createChildResolver(node);
                // We are certain that we want to create a new node, rather than resolving
                //  an existing one.
                return resolver._createNodeInstance(node, opts, register);
            }
        }
        else {
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
    _postInstantiateNode(node, resolver, instance, opts) {
        var _a;
        if (this._resolvers.postInstantiate) {
            this._resolvers.postInstantiate(node, resolver, instance, (_a = opts.parameters) !== null && _a !== void 0 ? _a : {});
        }
    }
    _instantiateOwnedNodeInstance(node, opts) {
        var _a;
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
                    const params = (_a = opts.parameters) !== null && _a !== void 0 ? _a : {};
                    if (!utils_1.has(params, node.paramKey)) {
                        if (node.optional) {
                            return undefined;
                        }
                        throw new errors_1.ParameterNotSuppliedError(node.paramKey, this.getResolveStack().map(planner_1.getDependencyNodeIdentifier));
                    }
                    return params[node.paramKey];
                }
                case "scope": {
                    const scope = this.getScopeRoot(node.scope);
                    if (scope === undefined) {
                        throw new errors_1.ScopeNotFoundError(node.scope, this.getResolveStack(node).map(planner_1.getDependencyNodeIdentifier), "The requested scope was not found.");
                    }
                    return scope;
                }
                case "parent":
                    return this._resolvers.parentIdentifier(node, opts);
                default:
                    return throwUnknownNodeType(node);
            }
        }
        finally {
            this._instantiationStack.pop();
        }
    }
    _createChildResolver(scopeOwner) {
        const resolver = new BasicDependencyGraphResolver(this._resolvers);
        resolver._ownedScope = scopeOwner || null;
        resolver._parent = this;
        return resolver;
    }
}
exports.BasicDependencyGraphResolver = BasicDependencyGraphResolver;
function throwUnknownNodeType(c) {
    throw new Error(`Unknown node type "${c.type}".`);
}
//# sourceMappingURL=graph-resolver.js.map