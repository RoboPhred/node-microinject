"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../scope");
const data_1 = require("../binder/data");
const utils_1 = require("../utils");
const errors_1 = require("../errors");
const utils_2 = require("./utils");
__export(require("./utils"));
class DependencyGraphPlanner {
    constructor(bindings) {
        //private _bindingsForIdentifier: Map<Identifier, BindingData[]>;
        this._planCache = new Map();
        /**
         * The current stack of identifiers being planned.
         */
        this._stack = [];
        /**
         * A map of scopes to scope instance data.
         */
        this._rootScopeInstances = new Map();
        this._bindingsForIdentifier = bindings ? new Map(bindings) : new Map();
        // Prepopulate our singleton scope.
        this._rootScopeInstances.set(scope_1.SingletonScope, {
            definer: scope_1.SingletonScope,
            instances: new Map()
        });
    }
    addBinding(identifier, binding) {
        let bindings = this._bindingsForIdentifier.get(identifier);
        if (!bindings) {
            bindings = [];
            this._bindingsForIdentifier.set(identifier, bindings);
        }
        if (Array.isArray(binding)) {
            bindings.push(...binding);
        }
        else {
            bindings.push(binding);
        }
        // We need to clear everthing, as a cached plan might involve an @Inject({all: true}) injection,
        //  so this new identifier might be a candidate for injection in a previous plan.
        this._planCache.clear();
    }
    getBindings(identifier) {
        // TODO: can perform filtering here for conditional bindings.
        return (this._bindingsForIdentifier.get(identifier) || []).map(x => x._getBinding());
    }
    hasBinding(identifier) {
        const bindings = this._bindingsForIdentifier.get(identifier);
        return bindings != null && bindings.length > 0;
    }
    /**
     * Gets a plan for the identifier, optionally using a specific binding.
     * @param identifier The identifier to get a plan for.
     * @param binding An optional binding to use for the identifier.  Useful if multiple bindings may apply.
     */
    getPlan(identifier, binding) {
        if (!binding) {
            const rootBindings = this.getBindings(identifier);
            if (rootBindings.length === 0) {
                throw new errors_1.DependencyResolutionError(identifier, [], "No bindings exist for the given identifier.");
            }
            else if (rootBindings.length > 1) {
                throw new errors_1.DependencyResolutionError(identifier, [], "More than one binding was resolved for the identifier.");
            }
            binding = rootBindings[0];
        }
        return {
            identifier,
            componentCreator: this._getComponentCreator(identifier, binding, this._rootScopeInstances)
        };
    }
    _getComponentCreator(identifier, binding, scopeInstances) {
        this._stack.push(identifier);
        let componentCreator;
        try {
            let creator = this._getScopedInstance(identifier, binding, scopeInstances);
            if (!creator) {
                // If the binding is in a scope, this will register the resulting ComponentCreator with that scope.
                //  This is to support reference loops during dependency lookup.
                creator = this._createComponentCreator(identifier, binding, scopeInstances);
            }
            componentCreator = creator;
        }
        finally {
            this._stack.pop();
        }
        return componentCreator;
    }
    _createComponentCreator(identifier, binding, scopeInstances) {
        if (binding.type === "value") {
            return {
                type: "value",
                value: binding.value
            };
        }
        switch (binding.type) {
            case "factory":
                {
                    return this._createFactoryCreator(identifier, binding, scopeInstances);
                }
                ;
            case "constructor":
                {
                    return this._createConstructorCreator(identifier, binding, scopeInstances);
                }
                ;
            default:
                return assertKnownBinding(binding);
        }
    }
    _createFactoryCreator(identifier, binding, scopeInstances) {
        const componentCreator = {
            type: "factory",
            factory: binding.factory
        };
        this._tryApplyScoping(identifier, binding, componentCreator, scopeInstances);
        // We cannot plan for anything inside a factory, as the user will
        //  look stuff up at resolution time.
        return componentCreator;
    }
    _createConstructorCreator(identifier, binding, scopeInstances) {
        const { ctor, injections } = binding;
        const ctorArgs = [];
        const componentCreator = {
            type: "constructor",
            ctor,
            args: ctorArgs
        };
        // If we are part of a scope, add it before resolving the dependencies.
        //  This may allow for cyclic graphs, but that is the resolver's problem.
        // We need to add it to the current scope set, not the child scope set.
        const childScopeInstances = this._tryApplyScoping(identifier, binding, componentCreator, scopeInstances);
        // Now we can recurse and resolve our dependencies.
        for (let i = 0; i < injections.length; i++) {
            const { all, optional, identifier: dependencyIdentifier } = injections[i];
            let dependencyCreator;
            const dependencyBindings = this.getBindings(dependencyIdentifier);
            if (all) {
                if (!optional && dependencyBindings.length === 0) {
                    throw new errors_1.DependencyResolutionError(dependencyIdentifier, this._stack, `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`);
                }
                // If we resolve an All, it must be an array.
                //  This is even the case when we are optional and no bindings were found.
                dependencyCreator = {
                    type: "array",
                    values: dependencyBindings.map(binding => ({
                        identifier: dependencyIdentifier,
                        componentCreator: this._getComponentCreator(dependencyIdentifier, binding, childScopeInstances)
                    }))
                };
            }
            else if (dependencyBindings.length === 0) {
                // No matching bindings.
                if (optional) {
                    // We are not an all / array, so the return value for optional is null.
                    dependencyCreator = {
                        type: "value",
                        value: null
                    };
                }
                throw new errors_1.DependencyResolutionError(dependencyIdentifier, this._stack, `No bindings exist for the required argument at position ${i} of bound constructor "${ctor.name}".`);
            }
            else if (dependencyBindings.length > 1) {
                // Array case was already handled, so this means we do not know what binding to use.
                throw new errors_1.DependencyResolutionError(dependencyIdentifier, this._stack, `More than one binding was resolved for the argument at position ${i} of bound constructor "${ctor.name}".`);
            }
            else {
                // At this point, we have exactly 1 binding on a 1-value injection.
                dependencyCreator = this._getComponentCreator(dependencyIdentifier, dependencyBindings[0], childScopeInstances);
            }
            ctorArgs.push({
                identifier: dependencyIdentifier,
                componentCreator: dependencyCreator
            });
        }
        return componentCreator;
    }
    _getScopedInstance(identifier, binding, scopeInstances) {
        if (!data_1.isScopeableBinding(binding)) {
            // Cannot scope this binding.
            return null;
        }
        const scope = binding.inScope;
        if (!scope) {
            // Binding is not in any scope.
            return null;
        }
        // Try to fetch the data for this scope.
        const instanceData = scopeInstances.get(scope);
        if (!instanceData) {
            throw new errors_1.DependencyResolutionError(identifier, this._stack, `The resolved binding requres scope "${utils_1.scopeToString(scope)}", but no child object defines this scope.`);
        }
        const instances = instanceData.instances;
        // Being created in a scope, check to see if there is already an
        //  instance of us in this scope.
        if (instances.has(identifier)) {
            return instances.get(identifier);
        }
        return null;
    }
    /**
     * Try to apply scoping data to the component.
     * This checks both inScope and defineScope.
     * It will also generate a child scoping map if one is required.
     * @param identifier The identifier of the component being scoped.
     * @param binding The binding being used to form the component creator.
     * @param component The component creator.
     * @param scopeInstances The current set of scope instances.
     * @returns The set of scope instances to use for any child component creators.
     */
    _tryApplyScoping(identifier, binding, component, scopeInstances) {
        // Pointless binding type check to make typescript happy.
        if (binding.type === "value") {
            // Value types cannot be scoped, nor can they be within a scope.
            //  This is because we have no way of binding to a specific instance within the scope.
            return scopeInstances;
        }
        // A component that cannot be placed in a scope also cannot serve as a scope itself.
        if (!utils_2.isComponentScopable(component))
            return scopeInstances;
        const { inScope, defineScope } = binding;
        // Check to see if the component is in a scope.
        if (inScope) {
            const instanceData = scopeInstances.get(inScope);
            if (!instanceData) {
                throw new errors_1.DependencyResolutionError(identifier, this._stack, `The resolved binding requres scope "${utils_1.scopeToString(inScope)}", but no child object defines this scope.`);
            }
            // The component is scoped, so add it as The Component for this specific identifier under the component.
            instanceData.instances.set(identifier, component);
            component.containingScope = inScope;
            // We might be being defined by a special case symbol, such as SingletonSymbol.
            if (typeof instanceData.definer !== "symbol") {
                component.containingScopeInstance = instanceData.definer;
            }
        }
        // Check if the component is defining a new scope.
        if (defineScope) {
            // We are a new scope, so set up a new scope instance map that
            //  contains us.  This will be used by children.
            // We need to create a new outer map as new child scopes within a scope should only be accessible within that scope.
            //  We still need to copy the outer scopes, however.  A scope is available to all children unless overrode with another
            //  object defining the same scope.
            component.defineScope = defineScope;
            return new Map(scopeInstances).set(defineScope, {
                definer: component,
                instances: new Map()
            });
        }
        // We are not defining a new scope, so keep passing the existing scope instance map.
        return scopeInstances;
    }
}
exports.default = DependencyGraphPlanner;
function assertKnownBinding(b) {
    throw new Error(`Encountered unknown binding type "${String(b.type)}".`);
}
//# sourceMappingURL=index.js.map