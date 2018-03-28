"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binder_impl_1 = require("./binder/binder-impl");
const utils_1 = require("./binder/utils");
const planner_1 = require("./planner");
const resolver_1 = require("./resolver");
const errors_1 = require("./errors");
class Container {
    constructor() {
        /**
         * All bindings currently registered with this container.
         */
        this._binders = new Map();
        this._planCache = new Map();
        this._resolver = new resolver_1.default();
        /**
         * Container to use if a binding is not find in this container.
         */
        this._parent = null;
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
    }
    /**
     * Loads bindings from Inversify-style container modules.
     * @param modules The Inversify-compatible container modules to load.
     */
    load(...modules) {
        const bind = this.bind.bind(this);
        modules.forEach(x => x.registry(bind));
        this._planCache.clear();
    }
    /**
     * Create a binder to bind a service identifier to an implementation.
     *
     * If the identifier is a class marked by @Injectable(), the binder will auto-bind
     * itself while still allowing you to override its behavior with the returned binder.
     *
     * If a class is passed with @Injectable(), the binding will be bound to both
     * the class and to the auto-bind identifier specified with @Injectable()
     * @param identifier The service identifier.
     * @returns A binder object to configure the binding.
     */
    bind(identifier) {
        const binder = new binder_impl_1.BinderImpl(identifier);
        this._addBinder(identifier, binder);
        // Check to see if this is an auto-bind injectable.
        const autoIdentifiers = utils_1.getProvidedIdentifiers(identifier);
        for (let identifier of autoIdentifiers) {
            this._addBinder(identifier, binder);
        }
        // Even thought we know what identifiers we are modifying,
        //  we may have some new identifiers which will be
        //  counted in an @Inject({all: true})
        // We could try to scan for these, but we should not be
        //  binding too much after we start to create things. 
        this._planCache.clear();
        return binder;
    }
    _addBinder(identifier, binder) {
        let binders = this._binders.get(identifier);
        if (binders == null) {
            binders = [];
            this._binders.set(identifier, binders);
        }
        binders.push(binder);
    }
    /**
     * Clears out knowledge of all resolved identifiers and scopes.
     * Previously resolved objects and factory bindings will still
     * continue to work normally off the old data.
     *
     * This does not clear the container's bindings.  All previously
     * configured bindings remain configured.
     */
    reset() {
        // Clearing the entire scope stack is as simple as getting
        //  a new graph resolver.
        this._resolver = new resolver_1.default();
        // No need to clear the cached plans.  Bindings are kept,
        //  so the plans are still valid.
    }
    /**
     * Gets the bound object for an identifier.  This may create the object if necessary depending on scope and previous creations.
     * If multiple objects are bound to the identifier, the object chosen may not be predictable.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get(identifier) {
        const binders = this._binders.get(identifier);
        if (!binders || binders.length === 0) {
            if (this._parent)
                return this._parent.get(identifier);
            throw new errors_1.DependencyResolutionError(identifier, [], `No binding exists for the identifier.`);
        }
        const plan = this._getPlan(identifier);
        return this._resolver.resolveInstance(plan);
    }
    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll(identifier) {
        const values = this._getAll(identifier);
        if (values.length === 0) {
            throw new errors_1.DependencyResolutionError(identifier, [], `No bindings exists for the identifier.`);
        }
        return values;
    }
    _getAll(identifier) {
        const binders = this._binders.get(identifier);
        if (binders == null) {
            if (this._parent)
                return this._parent.getAll(identifier);
            return [];
        }
        const bindData = new Map();
        for (let entry of this._binders) {
            bindData.set(entry[0], entry[1].map(x => x._getBinding()));
        }
        const plans = binders.map(x => planner_1.createPlanForBinding(identifier, x._getBinding(), bindData));
        // TODO: Scopes start fresh each plan.
        const values = plans.map(x => this._resolver.resolveInstance(x));
        if (this._parent) {
            return values.concat(this._parent._getAll(identifier));
        }
        return values;
    }
    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has(identifier) {
        return this._binders.has(identifier) || Boolean(this._parent && this._parent.has(identifier));
    }
    _getPlan(identifier) {
        let plan = this._planCache.get(identifier);
        if (!plan) {
            // TODO: This is nasty.  Fix this up when planner gets its cleanup pass.
            const bindData = new Map();
            for (let entry of this._binders) {
                bindData.set(entry[0], entry[1].map(x => x._getBinding()));
            }
            plan = planner_1.createPlanForIdentifier(identifier, bindData);
            this._planCache.set(identifier, plan);
        }
        return plan;
    }
}
exports.Container = Container;
//# sourceMappingURL=container.js.map