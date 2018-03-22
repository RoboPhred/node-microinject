"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_utils_1 = require("./scope-utils");
const errors_1 = require("./errors");
const injection_utils_1 = require("./injection-utils");
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
        return this._binding = new ScopedBindingImpl(container => container.create(ctor), scope_utils_1.isSingleton(ctor));
    }
    toFactory(factory) {
        if (typeof factory !== "function") {
            throw new TypeError("Factory must be a function.");
        }
        this._ensureCanBind();
        return this._binding = new ScopedBindingImpl(container => factory({ container }));
    }
    toDynamicValue(factory) {
        // Note that this is identical to toFactory.
        return this.toFactory(factory);
    }
    toConstantValue(value) {
        this._binding = new ConstBindingImpl(value);
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
        return this._binding = new ScopedBindingImpl(container => container.create(ctor), scope_utils_1.isSingleton(ctor));
    }
    _ensureCanBind() {
        if (this._binding != null) {
            throw new errors_1.BindingConfigurationError(`Cannot reconfigure binding for ${this._identifier}: Binding already established.`);
        }
    }
}
exports.BinderImpl = BinderImpl;
class BindingImpl {
}
exports.BindingImpl = BindingImpl;
/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
class ScopedBindingImpl extends BindingImpl {
    constructor(_create, defaultSingleton = false) {
        super();
        this._create = _create;
        this._singletonInstantiated = false;
        this._singletonValue = null;
        this._singleton = defaultSingleton;
    }
    _getBoundValue(context) {
        if (this._singleton) {
            if (!this._singletonInstantiated) {
                this._singletonValue = this._create(context.container);
                this._singletonInstantiated = true;
            }
            return this._singletonValue;
        }
        return this._create(context.container);
    }
    inSingletonScope() {
        this._singleton = true;
    }
    inTransientScope() {
        this._singleton = false;
    }
}
exports.ScopedBindingImpl = ScopedBindingImpl;
/**
 * A simple binding that provides a constant value.
 */
class ConstBindingImpl extends BindingImpl {
    constructor(_value) {
        super();
        this._value = _value;
    }
    _getBoundValue(context) {
        return this._value;
    }
}
exports.ConstBindingImpl = ConstBindingImpl;
