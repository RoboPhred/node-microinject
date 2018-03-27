
import {
    Identifier,
    Newable,
    Context,
    Scope,
    ServiceFactory
} from "./interfaces";

import {
    Container
} from "./container";

import {
    BindingConfigurationError
} from "./errors";

import {
    Binder,
    ScopedBinder
} from "./binder";

import {
    isSingleton, getInScope, getAsScope
} from "./scope-utils";

import {
    isInjectable
} from "./injection-utils";

import {
    BindingImpl,
    ScopedBindingImpl
} from "./binding-impl";

import {
    isAutoBindFactory
} from "./binding-utils";

import {
    identifierToString
} from "./utils";


/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 * 
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
export class BinderImpl<T = any> implements Binder {
    private _binding: BindingImpl | null = null;

    constructor(private _identifier: Identifier<T>) {}

    to<T>(ctor: Newable<T>): ScopedBinder {
        if (typeof ctor !== "function") {
            throw new TypeError("Target must be a constructor.");
        }
        this._ensureCanBind();
        return this._binding = new ScopedBindingImpl(
            this._identifier,
            context => context.container.create(ctor, context.scopes),
            ctor
        );
    }

    toDynamicValue<T>(factory: (context: Context) => T): ScopedBinder {      
        if (typeof factory !== "function") {
            throw new TypeError("Factory must be a function.");
        }
        this._ensureCanBind();
        return this._binding = new ScopedBindingImpl(this._identifier, factory);
    }

    toConstantValue<T>(value: T): void {
        this._binding = new ScopedBindingImpl(this._identifier, () => value);
    }

    // TODO: It may be desirable to find a way of removing access to this from outside the library.
    _getBinding(): BindingImpl {
        if (this._binding == null) {
            this._binding = this._createDefaultBinding();
        }
        return this._binding;
    }

    private _createDefaultBinding(): BindingImpl {
        if (typeof this._identifier !== "function") {
            throw new BindingConfigurationError(`Binding for ${this._identifier} was never established.  Auto-binding can only be used on injectable class constructors.`);
        }
        
        if (isInjectable(this._identifier)) {
            const ctor = this._identifier as Newable<T>;
            // Note that this is the same behavior as this.to()
            return this._binding = new ScopedBindingImpl(
                this._identifier,
                context => context.container.create(ctor, context.scopes),
                ctor
            );    
        }
        else if (isAutoBindFactory(this._identifier)) {
            const factory = this._identifier as ServiceFactory;
            return this._binding = new ScopedBindingImpl(
                this._identifier,
                factory,
                factory
            );
        }
        else {
            // This condition would throw for container.create(ctor), but we can give a more useful error message by knowing it was an auto-bind.
            throw new BindingConfigurationError(`Binding for identifier "${identifierToString(this._identifier)}" was never established.  Only @Factory functions or @Injectable classes may be auto-bound.`);
        }
        
    }

    private _ensureCanBind() {
        if (this._binding != null) {
            throw new BindingConfigurationError(`Cannot reconfigure binding for ${this._identifier}: Binding already established.`);
        }
    }
}
