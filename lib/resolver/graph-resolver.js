"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../scope");
const utils_1 = require("../planner/utils");
const utils_2 = require("../utils");
const component_resolver_1 = require("./component-resolver");
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
    return utils_1.isScopedDependencyNode(node) && node.createInScope != null;
}
function isNodeScopeCreator(node) {
    return utils_1.isScopedDependencyNode(node) && node.definesScope != null;
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
         * The stack of identifiers of the instantiations we are currently processing.
         * This should always contain all identifiers of _instantiationSet.values().map(x => identifier)
         */
        this._instantiationStack = [];
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
        /**
         * The scope which we are the owner of.
         *
         * This is set internally by the parent BasicDependencyGraphResolver,
         * as typescript grumbles about using the private ScopedDependencyNode
         * in the public constructor, and re-exporting it causes trouble down the line.
         */
        this._ownedScope = null;
        // Make sure to fill in any resolvers that the user didn't specify.
        this._resolvers = Object.assign({}, component_resolver_1.defaultComponentResolvers, (resolvers || {}));
    }
    /**
     * Returns a value indicating whether we are presently trying to resolve
     * the value of the given node.
     * This indicates that somewhere in our call stack is a call to resolveInstance(node).
     * @param node The node to check if we are resolving.
     * @returns ```true``` if the node is being resolved.
     */
    isResolving(node) {
        if (this._instantiationStack.indexOf(node) !== -1) {
            return true;
        }
        if (this._parent) {
            return this._parent.isResolving(node);
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
     * @param from The node to start retrieving the resolution stack at.
     */
    getResolveStack(from) {
        let stack;
        const idx = from ? this._instantiationStack.indexOf(from) : -1;
        if (idx === -1) {
            // Get the portion of the stack from the parent (if any), and add on our portion.
            const parentStack = this._parent ? this._parent.getResolveStack(from) : [];
            stack = parentStack.concat(this._instantiationStack);
        }
        else {
            stack = this._instantiationStack.slice(idx);
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
    resolveInstance(node) {
        return this._getNodeInstance(node);
    }
    _getNodeInstance(node) {
        if (isNodeScoped(node)) {
            // If the component is in a scope, we need to find the resolver that owns the scope.
            return this._getScopedNodeInstance(node);
        }
        else {
            // Transient or const.
            return this._createNodeInstance(node);
        }
    }
    _getScopedNodeInstance(node) {
        if (!node.createInScope) {
            throw new Error("_getScopedNodeInstance called on non-scoped component.");
        }
        // May be undefined if we are a singleton.
        // Scoped nodes have special handling to avoid duplicating scoped nodes
        //  when requested from a child resolver.
        // We first establish that the "owner" of all instances of a node belonging
        //  to a scope is the resolver that resolved the instance which represents the scope.
        //  That is: the component is cached where component.containingScopeInstance was created.
        const { instanceId, scopeOwnerInstanceId } = node;
        if (node.createInScope === scope_1.SingletonScope) {
            if (this._parent) {
                // singleton is handled by root resolver.
                return this._parent._getScopedNodeInstance(node);
            }
            // We are root, we own it.
            //  Continue below to look up or create the instance.
        }
        else if (!scopeOwnerInstanceId) {
            // Not a special scope, but the dependency graph didn't specify our owner instance.
            throw new Error("_getScopedNodeInstance called on a scoped component without a containingScopeInstance.");
        }
        else if (!this._ownedScope || scopeOwnerInstanceId !== this._ownedScope.instanceId) {
            // We do not own this instance, check the parent.
            if (!this._parent) {
                // This should never happen, so long as resolvers are always used and their owned scopes
                //  or ancestor setup is never messed with.
                throw new Error(`Could not find owner for scoped component "${utils_2.identifierToString(node.identifier)}".`);
            }
            return this._parent._getScopedNodeInstance(node);
        }
        // At this point, we are the owner of the node.
        // We need to check for, create, and cache the instance.
        // We still have to use .has() when looking for the instance, as its possible to store null or
        //  undefined as a scoped value through a factory binding.
        if (this._scopedInstances.has(instanceId)) {
            return this._scopedInstances.get(instanceId);
        }
        // Did not create it yet.  Create and store it now.
        const instance = this._createNodeInstance(node);
        this._scopedInstances.set(instanceId, instance);
        return instance;
    }
    _createNodeInstance(node) {
        if (isNodeScopeCreator(node) && (!this._ownedScope || node.scopeOwnerInstanceId !== this._ownedScope.instanceId)) {
            // If the node is defining a new scope which we do not own,
            //  we need to create a child resolver to hold the instances scoped to it.
            return this._createScopeRootNodeComponent(node);
        }
        else {
            // Not defining a scope, so no special handling.
            return this._createLocalNodeComponent(node);
        }
    }
    _createScopeRootNodeComponent(node) {
        // Create a new child resolver to hold the instances inside this new scope.
        //  Be sure to specify the parent and scope owner creator ref.
        const scopeResolver = this._createChildResolver(node);
        const value = scopeResolver.resolveInstance(node);
        return value;
    }
    _createLocalNodeComponent(node) {
        this._instantiationStack.push(node);
        try {
            switch (node.type) {
                case "constructor": {
                    return this._resolvers.ctor(node.identifier, node, this._createChildResolver());
                }
                case "factory": {
                    return this._resolvers.factory(node.identifier, node, this._createChildResolver());
                }
                case "value": {
                    // We still allow external resolution of simple values.
                    //  This is for wrapping, proxying, monkey-patching, and other such cross-cutting tomfoolery.
                    return this._resolvers.const(node.identifier, node, this._createChildResolver());
                }
                default:
                    throwUnknownNodeType(node);
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