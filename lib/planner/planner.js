"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuidv4 = require("uuid/v4");
const scope_1 = require("../scope");
const binding_1 = require("../binder/binding");
const utils_1 = require("../utils");
const errors_1 = require("../errors");
const interfaces_1 = require("./interfaces");
class DependencyGraphPlanner {
    constructor(_bindingResolver, initialStack, scopeInstances) {
        this._bindingResolver = _bindingResolver;
        /**
         * Maps binding IDs to their plan cache.
         */
        this._planCache = new Map();
        if (initialStack) {
            this._stack = initialStack.slice();
        }
        else {
            this._stack = [];
        }
        if (scopeInstances) {
            this._rootScopeInstances = scopeInstances;
        }
        else {
            // Prepopulate our singleton scope.
            this._rootScopeInstances = new Map();
            this._rootScopeInstances.set(scope_1.SingletonScope, {
                scopeDefiner: scope_1.SingletonScope,
                instances: new Map(),
            });
        }
    }
    /**
     * Gets a plan for the identifier, optionally using a specific binding.
     * @param identifier The identifier to get a plan for.
     * @param binding An optional binding to use for the identifier.  Useful if multiple bindings may apply.
     */
    getPlan(identifier, binding = undefined, opts = {}) {
        if (!binding) {
            const rootBindings = this._getBindings(identifier);
            if (rootBindings.length === 0) {
                throw new errors_1.DependencyResolutionError(identifier, this._stack, "No bindings exist for the given identifier.");
            }
            else if (rootBindings.length > 1) {
                throw new errors_1.DependencyResolutionError(identifier, this._stack, "More than one binding was resolved for the identifier.");
            }
            binding = rootBindings[0];
        }
        const dependencyNode = this._getDependencyNode(identifier, binding, this._rootScopeInstances, opts);
        return dependencyNode;
    }
    _getBindings(identifier) {
        return this._bindingResolver(identifier);
    }
    _getDependencyNode(identifier, binding, scopeInstances, opts = {}) {
        this._stack.push(identifier);
        let dependencyNode;
        try {
            if (!opts.noCache && this._planCache.has(binding.bindingId)) {
                return this._planCache.get(binding.bindingId);
            }
            let node = this._getScopedInstance(identifier, binding, scopeInstances);
            if (!node) {
                // If the binding is in a scope, this will register the resulting ComponentCreator with that scope.
                //  This is to support reference loops during dependency lookup.
                node = this._createDependencyNode(identifier, binding, scopeInstances, opts);
            }
            dependencyNode = node;
            if (!opts.noCache) {
                this._planCache.set(binding.bindingId, dependencyNode);
            }
        }
        finally {
            this._stack.pop();
        }
        return dependencyNode;
    }
    _createDependencyNode(identifier, binding, scopeInstances, opts) {
        if (binding.type === "value") {
            return Object.assign(Object.assign({}, binding), { identifier, nodeId: uuidv4() });
        }
        switch (binding.type) {
            case "factory": {
                return this._createFactoryNode(identifier, binding, scopeInstances);
            }
            case "constructor": {
                return this._createConstructorNode(identifier, binding, scopeInstances, opts);
            }
            case "parent": {
                return Object.assign(Object.assign({}, binding), { nodeId: uuidv4(), identifier });
            }
            default:
                return assertKnownBinding(binding);
        }
    }
    _createFactoryNode(identifier, binding, scopeInstances) {
        const node = Object.assign(Object.assign({}, binding), { identifier, nodeId: uuidv4(), planner: this });
        const [childScopeInstances, rollback] = this._tryApplyScoping(identifier, node, scopeInstances);
        try {
            node.planner = new DependencyGraphPlanner(this._bindingResolver, this._stack, childScopeInstances);
            // We cannot plan for anything inside a factory, as the user will
            //  look stuff up at resolution time.
            return node;
        }
        catch (err) {
            rollback();
            throw err;
        }
    }
    _createConstructorNode(identifier, binding, scopeInstances, opts) {
        // If we have tried to resolve this constructor previously, we are circular.
        if (this._stack.indexOf(identifier) !== this._stack.length - 1) {
            throw new errors_1.DependencyResolutionError(identifier, this._stack, "Circular dependency detected.");
        }
        const { ctor, ctorInjections } = binding;
        const ctorInjectionNodes = [];
        const propInjectionNodes = new Map();
        const node = Object.assign(Object.assign({}, binding), { identifier, nodeId: uuidv4(), ctor,
            ctorInjectionNodes,
            propInjectionNodes });
        // If we are part of a scope, add it before resolving the dependencies.
        //  This may allow for cyclic graphs, but that is the resolver's problem.
        // We need to add it to the current scope set, not the child scope set.
        const [childScopeInstances, rollback] = this._tryApplyScoping(identifier, node, scopeInstances);
        try {
            // Now we can recurse and resolve our dependencies.
            for (let i = 0; i < ctorInjections.length; i++) {
                let injectedValue;
                try {
                    injectedValue = this._planInjection(ctorInjections[i], childScopeInstances, opts);
                }
                catch (err) {
                    if (typeof err.message === "string") {
                        err.message = `Error injecting argument ${i} of bound constructor "${ctor.name}": ${err.message}`;
                    }
                    throw err;
                }
                ctorInjectionNodes.push(injectedValue);
            }
            for (let [propName, injection] of binding.propInjections) {
                let injectedValue;
                try {
                    injectedValue = this._planInjection(injection, childScopeInstances, opts);
                }
                catch (err) {
                    if (typeof err.message === "string") {
                        err.message = `Error injecting property ${propName} of bound constructor "${ctor.name}": ${err.message}`;
                    }
                    throw err;
                }
                propInjectionNodes.set(propName, injectedValue);
            }
        }
        catch (err) {
            rollback();
            throw err;
        }
        return node;
    }
    _planInjection(injection, childScopeInstances, opts) {
        switch (injection.type) {
            case "parameter": {
                return this._planParamValueInjection(injection);
            }
            case "scope": {
                return this._planScopeInjection(injection);
            }
            case "identifier": {
                if (injection.all) {
                    return this._planAllValuesInjection(injection, childScopeInstances, opts);
                }
                return this._planSingleValueInjection(injection, childScopeInstances, opts);
            }
        }
    }
    _planScopeInjection(injection) {
        return {
            type: "scope",
            scope: injection.scope,
        };
    }
    _planParamValueInjection(injection) {
        const { paramKey, optional } = injection;
        return {
            type: "param",
            optional: optional !== null && optional !== void 0 ? optional : false,
            paramKey,
        };
    }
    _planAllValuesInjection(injection, childScopeInstances, opts) {
        const { optional, identifier: dependencyIdentifier } = injection;
        const dependencyBindings = this._getBindings(dependencyIdentifier);
        if (!optional && dependencyBindings.length === 0) {
            throw new errors_1.DependencyResolutionError(dependencyIdentifier, this._stack, `No bindings exist for the required argument.`);
        }
        const injectedArg = dependencyBindings.map((dependencyBinding) => this._getDependencyNode(dependencyIdentifier, dependencyBinding, childScopeInstances, opts));
        return injectedArg;
    }
    _planSingleValueInjection(injection, childScopeInstances, opts) {
        const { optional, identifier: dependencyIdentifier } = injection;
        const dependencyBindings = this._getBindings(dependencyIdentifier);
        if (dependencyBindings.length === 0) {
            // No matching bindings.
            if (!optional) {
                throw new errors_1.DependencyResolutionError(dependencyIdentifier, this._stack, `No bindings exist for the required argument.`);
            }
            // We are not an all / array, so the return value for optional is undefuned.
            return undefined;
        }
        if (dependencyBindings.length > 1) {
            // Array case was already handled, so this means we do not know what binding to use.
            throw new errors_1.DependencyResolutionError(dependencyIdentifier, this._stack, `More than one binding was resolved for the argument.`);
        }
        // At this point, we have exactly 1 binding on a 1-value injection.
        const injectedArg = this._getDependencyNode(dependencyIdentifier, dependencyBindings[0], childScopeInstances, opts);
        return injectedArg;
    }
    _getScopedInstance(identifier, binding, scopeInstances) {
        if (!binding_1.isScopeableBinding(binding)) {
            // Cannot scope this binding.
            return null;
        }
        const scope = binding.createInScope;
        if (!scope) {
            // Binding is not in any scope.
            return null;
        }
        // Try to fetch the data for this scope.
        const instanceData = scopeInstances.get(scope);
        if (!instanceData) {
            throw new errors_1.DependencyResolutionError(identifier, this._stack, `The resolved binding requires scope "${utils_1.scopeToString(scope)}", but no child object defines this scope.`);
        }
        const instances = instanceData.instances;
        // Being created in a scope, check to see if there is already an
        //  instance of us in this scope.
        // Check instance by bindingId, as multiple identifiers
        //  may be aliases of a scoped binding.
        if (instances.has(binding.bindingId)) {
            return instances.get(binding.bindingId);
        }
        return null;
    }
    /**
     * Try to apply scoping data to the dependency node.
     * This checks for and applies both createInScope and definesScope.
     * It will also generate a child scoping map if one is required.
     * @param identifier The identifier of the component being scoped.
     * @param binding The binding being used to form the dependency node.
     * @param node The dependency node to apply scoping to.
     * @param scopeInstances The current set of scope instances.
     * @returns The set of scope instances to use for any child nodes.
     */
    _tryApplyScoping(identifier, node, scopeInstances) {
        // A node that cannot be placed in a scope also cannot serve as a scope.
        if (!interfaces_1.isBindingDependencyNode(node) || !binding_1.isScopeableBinding(node)) {
            return [scopeInstances, () => { }];
        }
        const { createInScope, definesScope } = node;
        let rollback = () => { };
        // Check to see if the component is in a scope.
        if (createInScope) {
            const instanceData = scopeInstances.get(createInScope);
            if (!instanceData) {
                throw new errors_1.DependencyResolutionError(identifier, this._stack, `The resolved binding requres scope "${utils_1.scopeToString(createInScope)}", but no child object defines this scope.`);
            }
            // The newly created node is scoped, so record it as being
            //  the specific node for the identifier in this scope instance.
            // Set instance by bindingId, as multiple identifiers
            //  may be aliases of a scoped binding.
            instanceData.instances.set(node.bindingId, node);
            rollback = () => {
                instanceData.instances.delete(node.bindingId);
            };
            // We might be being defined by a special case symbol, such as SingletonSymbol.
            if (typeof instanceData.scopeDefiner !== "symbol") {
                node.scopeOwnerNodeId = instanceData.scopeDefiner.nodeId;
            }
        }
        // Check if the component is defining a new scope.
        if (definesScope) {
            // We are a new scope, so set up a new scope instance map that
            //  contains us.  This will be used by children.
            // We need to create a new outer map as new child scopes within a scope should only be accessible within that scope.
            //  We still need to copy the outer scopes, however.  A scope is available to all children unless overrode with another
            //  object defining the same scope.
            scopeInstances = new Map(scopeInstances).set(definesScope, {
                scopeDefiner: node,
                instances: new Map(),
            });
        }
        // We are not defining a new scope, so keep passing the existing scope instance map.
        return [scopeInstances, rollback];
    }
}
exports.DependencyGraphPlanner = DependencyGraphPlanner;
function assertKnownBinding(b) {
    throw new Error(`Encountered unknown binding type "${String(b.type)}".`);
}
//# sourceMappingURL=planner.js.map