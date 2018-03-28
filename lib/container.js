"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binder_impl_1 = require("./binder/binder-impl");
const utils_1 = require("./binder/utils");
const planner_1 = require("./planner");
const resolver_1 = require("./resolver");
const errors_1 = require("./errors");
class Container {
    constructor() {
        this._planner = new planner_1.default();
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
        return binder;
    }
    _addBinder(identifier, binder) {
        this._planner.addBinding(identifier, binder);
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
        if (this._planner.hasBinding(identifier)) {
            const plan = this._planner.getPlan(identifier);
            return this._resolver.resolveInstance(plan);
        }
        if (this._parent) {
            return this._parent.get(identifier);
        }
        throw new errors_1.DependencyResolutionError(identifier, [], `No bindings exists for the identifier.`);
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
        const values = this._parent ? this._parent._getAll(identifier) : [];
        const bindings = this._planner.getBindings(identifier);
        if (bindings.length > 0) {
            const plans = bindings.map(binding => this._planner.getPlan(identifier, binding));
            values.push(...plans.map(plan => this._resolver.resolveInstance(plan)));
        }
        return values;
    }
    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has(identifier) {
        return this._planner.hasBinding(identifier) || Boolean(this._parent && this._parent.has(identifier));
    }
}
exports.Container = Container;
//# sourceMappingURL=container.js.map