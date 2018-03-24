
import {
    Identifier,
    Newable,
    Context
} from "./interfaces";

import {
    Binder,
    ScopedBinder
} from "./binder";

import {
    isSingleton
} from "./scope-utils";

import {
    Container
} from "./container";

import {
    BindingConfigurationError
} from "./errors";
import { isInjectable } from "./injection-utils";


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
        return this._binding = new ScopedBindingImpl(container => container.create(ctor), isSingleton(ctor));
    }

    toDynamicValue<T>(factory: (context: Context) => T): ScopedBinder {      
        if (typeof factory !== "function") {
            throw new TypeError("Factory must be a function.");
        }
        this._ensureCanBind();
        return this._binding = new ScopedBindingImpl(container => factory({container}));
    }

    toConstantValue<T>(value: T): void {
        this._binding = new ConstBindingImpl(value);
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
        
        const ctor: Newable<T> = this._identifier;
        if (!isInjectable(ctor)) {
            // This condition would throw for container.create(ctor), but we can give a more useful error message by knowing it was an auto-bind.
            throw new BindingConfigurationError(`Binding for ${ctor.name} was never established.  A class constructor lacking the @Injectable() annotation cannot be auto-bound.`);
        }
        // Note that this is the same behavior as this.to()
        return this._binding = new ScopedBindingImpl(container => container.create(ctor), isSingleton(ctor));
    }

    private _ensureCanBind() {
        if (this._binding != null) {
            throw new BindingConfigurationError(`Cannot reconfigure binding for ${this._identifier}: Binding already established.`);
        }
    }
}

export abstract class BindingImpl {
    abstract _getBoundValue(context: Context): any;
}

/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
export class ScopedBindingImpl extends BindingImpl implements ScopedBinder {
    private _singleton: boolean;
    private _singletonInstantiated = false;
    private _singletonValue: any = null;

    constructor(private _create: (container: Container) => any, defaultSingleton: boolean = false) {
        super();
        this._singleton = defaultSingleton;
    }
    
    _getBoundValue(context: Context) {
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

/**
 * A simple binding that provides a constant value.
 */
export class ConstBindingImpl extends BindingImpl {
    constructor(private _value: any) {
        super();
    }

    _getBoundValue(context: Context) {
        return this._value;
    }
}
