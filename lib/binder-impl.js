"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const scope_utils_1 = require("./scope-utils");
const injection_utils_1 = require("./injection-utils");
const binding_impl_1 = require("./binding-impl");
/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 *
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
class BinderImpl {
    constructor(_identifier) {
        this._identifier = _identifier;
        this._binding = null;
    }
    to(ctor) {
        if (typeof ctor !== "function") {
            throw new TypeError("Target must be a constructor.");
        }
        this._ensureCanBind();
        return this._binding = new binding_impl_1.ScopedBindingImpl(container => container.create(ctor), scope_utils_1.isSingleton(ctor));
    }
    toDynamicValue(factory) {
        if (typeof factory !== "function") {
            throw new TypeError("Factory must be a function.");
        }
        this._ensureCanBind();
        return this._binding = new binding_impl_1.ScopedBindingImpl(container => factory({ container }));
    }
    toConstantValue(value) {
        this._binding = new binding_impl_1.ConstBindingImpl(value);
    }
    // TODO: It may be desirable to find a way of removing access to this from outside the library.
    _getBinding() {
        if (this._binding == null) {
            this._binding = this._createDefaultBinding();
        }
        return this._binding;
    }
    _createDefaultBinding() {
        if (typeof this._identifier !== "function") {
            throw new errors_1.BindingConfigurationError(`Binding for ${this._identifier} was never established.  Auto-binding can only be used on injectable class constructors.`);
        }
        const ctor = this._identifier;
        if (!injection_utils_1.isInjectable(ctor)) {
            // This condition would throw for container.create(ctor), but we can give a more useful error message by knowing it was an auto-bind.
            throw new errors_1.BindingConfigurationError(`Binding for ${ctor.name} was never established.  A class constructor lacking the @Injectable() annotation cannot be auto-bound.`);
        }
        // Note that this is the same behavior as this.to()
        return this._binding = new binding_impl_1.ScopedBindingImpl(container => container.create(ctor), scope_utils_1.isSingleton(ctor));
    }
    _ensureCanBind() {
        if (this._binding != null) {
            throw new errors_1.BindingConfigurationError(`Cannot reconfigure binding for ${this._identifier}: Binding already established.`);
        }
    }
}
exports.BinderImpl = BinderImpl;
//# sourceMappingURL=binder-impl.js.map