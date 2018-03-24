
import {
    Context,
    Scope,
    Newable
} from "./interfaces";

import {
    ScopedBinder
} from "./binder";

import {
    BindingConfigurationError
} from "./errors";

import {
    Container
} from "./container";

import {
    isSingleton,
    getInScope,
    getAsScope
} from "./scope-utils";


export interface BindingImpl {
    _getBoundValue(context: Context): any;
}

/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
export class ScopedBindingImpl implements BindingImpl, ScopedBinder {
    private _singleton: boolean | null = null;
    private _singletonValue: any;
    private _singletonInitialized = false;

    private _inScope: Scope = undefined;
    private _asScope: Scope = undefined;

    /**
     * A map of scope-defining instances to the instance of this service for that scope.
     */
    private _scopeInstances = new WeakMap<any, any>();

    constructor(private _create: (context: Context) => any, autoBindTarget?: Newable<any>) {
        if (autoBindTarget) {
            this._singleton = isSingleton(autoBindTarget);
            this._inScope = getInScope(autoBindTarget);
            this._asScope = getAsScope(autoBindTarget);
        }
    }
    
    _getBoundValue(context: Context) {
        if (this._asScope) {
            // We are acting as a scope.  Add ourselfs to the list of active scopes.
            //  Make a copy, so we do not interfere with other upstream operations.
            //  We may override another setting, as we are allowed to have nested copies
            //  of the same scope provider.
            const scopes = new Map(context.scopes);
            scopes.set(this._asScope, this);
            context = {
                ...context,
                scopes
            };
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

            let value: any;
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

    inScope(scope: Scope) {
        this._checkCanSetInScope();
        if (scope == null) {
            throw new TypeError("Scope must not be null or undefined.");
        }
        this._inScope = scope;
    }

    asScope(scope: Scope) {
        if (scope == null) {
            throw new TypeError("Scope must not be null or undefined.");
        }
        if (this._asScope !== undefined) {
            throw new BindingConfigurationError("Cannot change scope once it has already been set.");
        }
        this._asScope = scope;
    }

    private _checkCanSetInScope() {
        if (this._inScope !== undefined) {
            throw new BindingConfigurationError("Cannot change scope once it has already been set.");
        }
    }
}

/**
 * A simple binding that provides a constant value.
 */
export class ConstBindingImpl implements BindingImpl {
    constructor(private _value: any) {}

    _getBoundValue(context: Context) {
        return this._value;
    }
}
