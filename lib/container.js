"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injection_utils_1 = require("./injection-utils");
const binding_utils_1 = require("./binding-utils");
const errors_1 = require("./errors");
const binder_impl_1 = require("./binder-impl");
const utils_1 = require("./utils");
class Container {
    constructor() {
        /**
         * All bindings currently registered with this container.
         */
        this._binders = new Map();
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
        const autoIdentifiers = binding_utils_1.getProvidedIdentifiers(identifier);
        for (let identifier of autoIdentifiers) {
            this._addBinder(identifier, binder);
        }
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
     * Create a new instance of an injectable class.
     * The class must be declared injectable using the @Injectable annotation.
     * Injectable constructor arguments will be resolved.
     * @param ctor The class constructor.
     * @returns The created class.
     */
    create(ctor, scopes) {
        if (!injection_utils_1.isInjectable(ctor)) {
            throw new Error(`The constructor "${ctor.name}" is not injectable.`);
        }
        // If no scopes specified, create a scope map to avoid repeated
        //  map creation during dependency resolution loop.
        if (!scopes) {
            scopes = new Map();
        }
        const dependencies = injection_utils_1.getConstructorInjections(ctor);
        const resolved = dependencies.map((injectData, i) => {
            if (injectData.identifier == null) {
                throw new Error(`Constructor "${ctor.name}" parameter ${i} has injection annotation but no service identifier.`);
            }
            const has = this.has(injectData.identifier);
            if (!has) {
                if (injectData.optional)
                    return injectData.all ? [] : null;
                throw new errors_1.IdentifierNotBoundError(`Constructor "${ctor.name}" parameter ${i} requests identifier "${utils_1.identifierToString(injectData.identifier)}" which is not bound.`);
            }
            if (injectData.all) {
                return this.getAll(injectData.identifier, scopes);
            }
            else {
                return this.get(injectData.identifier, scopes);
            }
        });
        return new ctor(...resolved);
    }
    /**
     * Gets the bound object for an identifier.  This may create the object if necessary depending on scope and previous creations.
     * If multiple objects are bound to the identifier, the object chosen may not be predictable.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get(identifier, scopes) {
        const binders = this._binders.get(identifier);
        if (binders == null) {
            if (this._parent)
                return this._parent.get(identifier, scopes);
            throw new errors_1.IdentifierNotBoundError(`No binding exists for identifier "${utils_1.identifierToString(identifier)}".`);
        }
        if (!scopes)
            scopes = new Map();
        return binders[0]._getBinding()._getBoundValue({ container: this, scopes });
    }
    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll(identifier, scopes) {
        const binders = this._binders.get(identifier);
        if (binders == null) {
            if (this._parent)
                return this._parent.getAll(identifier, scopes);
            throw new errors_1.IdentifierNotBoundError(`No binding exists for identifier "${utils_1.identifierToString(identifier)}".`);
        }
        if (!scopes)
            scopes = new Map();
        const context = { container: this, scopes };
        const localValues = binders.map(x => x._getBinding()._getBoundValue(context));
        const parentValues = this._parent ? this._parent.getAll(identifier, scopes) : [];
        return localValues.concat(parentValues);
    }
    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has(identifier) {
        return this._binders.has(identifier) || Boolean(this._parent && this._parent.has(identifier));
    }
}
exports.Container = Container;
//# sourceMappingURL=container.js.map