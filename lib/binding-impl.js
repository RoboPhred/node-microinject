"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
class ScopedBindingImpl {
    constructor(_create, defaultSingleton = false) {
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
class ConstBindingImpl {
    constructor(_value) {
        this._value = _value;
    }
    _getBoundValue(context) {
        return this._value;
    }
}
exports.ConstBindingImpl = ConstBindingImpl;
