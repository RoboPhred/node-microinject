"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../scope");
const planner_1 = require("../planner");
const utils_1 = require("../utils");
const component_resolver_1 = require("./component-resolver");
function isNodeScoped(node) {
    return planner_1.isComponentScopable(node.componentCreator) && node.componentCreator.containingScope != null;
}
function isNodeScopeCreator(node) {
    return planner_1.isComponentScopable(node.componentCreator) && node.componentCreator.defineScope != null;
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
    constructor(resolvers, _ownedScope) {
        this._ownedScope = _ownedScope;
        /**
         * The stack of identifiers of the instantiations we are currently processing.
         * This should always contain all identifiers of _instantiationSet.values().map(x => identifier)
         */
        this._instantiationStack = [];
        /**
         * A map of all ongoing instantiations.
         * Maps the ComponentCreator of the instantiation to the node that caused it to begin.
         */
        this._instantiationSet = new Map();
        /**
         * Components scoped to scope definers specified in our _ownedScopes.
         */
        // Note: Right now, we are relying on the planner using object reference equality when
        //  specifying ComponentCreators that should be the same component instance.
        this._scopedComponents = new Map();
        /**
         * The parent resolver.
         * Used to seek out the owner of scoped components so
         * we do not duplicate a scoped component in a child resolver.
         *
         * This is set on the child by the parent, to keep it out of the public constructor.
         */
        this._parent = null;
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
        // We need to check the componentCreator value ref, as multiple
        //  nodes can share the same object reference, and componentCreators
        //  are ref-equals in this case.
        if (this._instantiationSet.has(node.componentCreator)) {
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
        const idx = from ? this._instantiationStack.findIndex(x => x.componentCreator === from.componentCreator) : -1;
        if (idx === -1) {
            stack = this._parent ? this._parent.getResolveStack(from) : [];
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
        return this._getNodeComponent(node);
    }
    _getNodeComponent(node) {
        const component = node.componentCreator;
        if (isNodeScoped(node)) {
            // If the component is in a scope, we need to find the resolver that owns the scope.
            return this._getScopedNodeComponent(node);
        }
        else {
            // Transient or value.
            return this._createNodeComponent(node);
        }
    }
    _getScopedNodeComponent(node) {
        const component = node.componentCreator;
        if (!component.containingScope)
            throw new Error("_getScopedNodeComponent called on non-scoped component.");
        // May be undefined if we are a singleton.
        const containingComponent = component.containingScopeInstance;
        // Scoped nodes have special handling to avoid duplicating scoped nodes
        //  when requested from a child resolver.
        // We first establish that the "owner" of all instances of a node belonging
        //  to a scope is the resolver that resolved the instance which represents the scope.
        //  That is: the component is cached where component.containingScopeInstance was created.
        if (component.containingScope === scope_1.SingletonScope) {
            if (this._parent) {
                // singleton is handled by root resolver.
                return this._parent._getScopedNodeComponent(node);
            }
            // We are root, we own it.
            //  Continue below to look up or create the instance.
        }
        else if (!containingComponent) {
            // Not a special scope, but the dependency graph didn't specify our owner instance.
            throw new Error("_getScopedNodeComponent called on a scoped component without a containingScopeInstance.");
        }
        else if (containingComponent !== this._ownedScope) {
            // We do not own this instance, check the parent.
            if (!this._parent) {
                // This should never happen, so long as resolvers are always used and their owned scopes
                //  or ancestor setup is never messed with.
                throw new Error(`Could not find owner for scoped component "${utils_1.identifierToString(node.identifier)}".`);
            }
            return this._parent._getScopedNodeComponent(node);
        }
        // At this point, we are the owner of the component (because we created its scope instance).
        //  We check for, create, and cache the component here.
        // We still have to use .has() when looking for the component, as its possible to store null or
        //  undefined as a scoped value through a factory binding.
        if (this._scopedComponents.has(component)) {
            return this._scopedComponents.get(component);
        }
        // Did not create it yet.  Create and store it now.
        const instance = this._createNodeComponent(node);
        this._scopedComponents.set(component, instance);
        return instance;
    }
    _createNodeComponent(node) {
        if (isNodeScopeCreator(node) && node.componentCreator !== this._ownedScope) {
            // If the node is defining a new scope, we need to create a child resolver to hold its
            //  scoped components.
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
        const scopeResolver = this._createChildResolver(node.componentCreator);
        const value = scopeResolver.resolveInstance(node);
        return value;
    }
    _createLocalNodeComponent(node) {
        const component = node.componentCreator;
        this._instantiationStack.push(node);
        this._instantiationSet.set(node.componentCreator, node);
        try {
            switch (component.type) {
                case "array":
                    {
                        return component.values.map(x => this._createNodeComponent(x));
                    }
                    ;
                case "constructor": {
                    return this._resolvers.ctor(node.identifier, component, this._createChildResolver());
                }
                case "factory": {
                    return this._resolvers.factory(node.identifier, component, this._createChildResolver());
                }
                case "value": {
                    // We still allow external users the ability to resolve simple values.
                    //  This is for wrapping, proxying, monkey-patching, and other such cross-cutting tomfoolery.
                    return this._resolvers.value(node.identifier, component, this._createChildResolver());
                }
                default:
                    throwUnknownComponent(component);
            }
        }
        finally {
            this._instantiationStack.pop();
            this._instantiationSet.delete(node.componentCreator);
        }
    }
    _createChildResolver(scopeOwner) {
        const resolver = new BasicDependencyGraphResolver(this._resolvers, scopeOwner);
        resolver._parent = this;
        return resolver;
    }
}
exports.BasicDependencyGraphResolver = BasicDependencyGraphResolver;
function throwUnknownComponent(c) {
    throw new Error(`Unknown component type "${c.type}".`);
}
//# sourceMappingURL=graph-resolver.js.map