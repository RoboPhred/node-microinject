"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const symbols_1 = require("./symbols");
const scope_utils_1 = require("./scope-utils");
/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
class ScopedBindingImpl {
    constructor(_identifier, _create, autoBindTarget) {
        this._identifier = _identifier;
        this._create = _create;
        this._singleton = null;
        this._singletonInitialized = false;
        this._inScope = undefined;
        this._asScope = undefined;
        /**
         * A map of scope-defining instances to the instance of this service for that scope.
         */
        this._scopeInstances = new WeakMap();
        if (autoBindTarget) {
            this._singleton = scope_utils_1.isSingleton(autoBindTarget);
            this._inScope = scope_utils_1.getInScope(autoBindTarget);
            this._asScope = scope_utils_1.getAsScope(autoBindTarget);
            if (this._asScope === symbols_1.AsScopeSelfIdentifedSymbol) {
                this._asScope = this._identifier;
            }
        }
    }
    _getBoundValue(context) {
        if (this._asScope) {
            // We are acting as a scope.  Add ourselfs to the list of active scopes.
            //  Make a copy, so we do not interfere with other upstream operations.
            //  We may override another setting, as we are allowed to have nested copies
            //  of the same scope provider.
            const scopes = new Map(context.scopes);
            scopes.set(this._asScope, this);
            context = Object.assign({}, context, { scopes });
        }
        if (this._singleton) {
            if (!this._singletonInitialized) {
                this._singletonValue = this._create(context);
            }
            return this._singletonValue;
        }
        if (this._inScope) {
            if (!context.scopes.has(this._inScope)) {
                throw new Error(`Cannot create object: Object requires a scope for "${this._inScope}" which is not present in the current context.`);
            }
            const scopeKey = context.scopes.get(this._inScope);
            let value;
            if (!this._scopeInstances.has(scopeKey)) {
                value = this._create(context);
                this._scopeInstances.set(scopeKey, value);
            }
            else {
                value = this._scopeInstances.get(scopeKey);
            }
            return value;
        }
        return this._create(context);
    }
    inSingletonScope() {
        this._checkCanSetInScope();
        this._singleton = true;
    }
    inTransientScope() {
        this._checkCanSetInScope();
        this._singleton = false;
    }
    inScope(scope) {
        this._checkCanSetInScope();
        if (scope == null) {
            throw new TypeError("Scope must not be null or undefined.");
        }
        this._inScope = scope;
    }
    asScope(scope) {
        if (this._asScope !== undefined) {
            throw new errors_1.BindingConfigurationError("Cannot change scope once it has already been set.");
        }
        this._asScope = (scope !== undefined) ? scope : this._identifier;
    }
    _checkCanSetInScope() {
        if (this._inScope !== undefined) {
            throw new errors_1.BindingConfigurationError("Cannot change scope once it has already been set.");
        }
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
//# sourceMappingURL=binding-impl.js.map