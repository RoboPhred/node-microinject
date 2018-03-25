import { Context } from "./interfaces";
import { ScopedBinder } from "./binder";
import { Container } from "./container";
export interface BindingImpl {
    _getBoundValue(context: Context): any;
}
/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
export declare class ScopedBindingImpl implements BindingImpl, ScopedBinder {
    private _create;
    private _singleton;
    private _singletonInstantiated;
    private _singletonValue;
    constructor(_create: (container: Container) => any, defaultSingleton?: boolean);
    _getBoundValue(context: Context): any;
    inSingletonScope(): void;
    inTransientScope(): void;
}
/**
 * A simple binding that provides a constant value.
 */
export declare class ConstBindingImpl implements BindingImpl {
    private _value;
    constructor(_value: any);
    _getBoundValue(context: Context): any;
}
