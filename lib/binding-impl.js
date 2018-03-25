"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
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
         * A map of guids within our _inScope to the instance of this service for that scope.
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
        // The scope must be established before the value is created, so that child resolutions
        //  can make use of it.
        if (this._asScope) {
            // We are acting as a scope.  Add ourselfs to the list of active scopes.
            //  Make a copy, so we do not interfere with other upstream operations.
            //  We may override another setting, as we are allowed to have nested copies
            //  of the same scope provider.
            const scopes = new Map(context.scopes);
            const scopeId = uuid_1.v4();
            scopes.set(this._asScope, scopeId);
            context = Object.assign({}, context, { scopes });
        }
        let value;
        if (this._singleton) {
            if (!this._singletonInitialized) {
                this._singletonValue = this._create(context);
            }
            value = this._singletonValue;
        }
        else if (this._inScope) {
            if (!context.scopes.has(this._inScope)) {
                throw new Error(`Cannot create object: Object requires a scope for "${this._inScope}" which is not present in the current context.`);
            }
            const scopeKey = context.scopes.get(this._inScope);
            if (!this._scopeInstances.has(scopeKey)) {
                value = this._create(context);
                this._scopeInstances.set(scopeKey, value);
            }
            else {
                value = this._scopeInstances.get(scopeKey);
            }
        }
        else {
            // Transient.
            value = this._create(context);
        }
        return value;
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
//# sourceMappingURL=binding-impl.js.map