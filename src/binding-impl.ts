
import {
    Context
} from "./interfaces";

import {
    ScopedBinder
} from "./binder";

import {
    Container
} from "./container";


export interface BindingImpl {
    _getBoundValue(context: Context): any;
}

/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
export class ScopedBindingImpl implements BindingImpl, ScopedBinder {
    private _singleton: boolean;
    private _singletonInstantiated = false;
    private _singletonValue: any = null;

    constructor(private _create: (container: Container) => any, defaultSingleton: boolean = false) {
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
export class ConstBindingImpl implements BindingImpl {
    constructor(private _value: any) {}

    _getBoundValue(context: Context) {
        return this._value;
    }
}
