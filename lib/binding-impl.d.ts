import { Identifier, Context, Scope, Newable } from "./interfaces";
import { ScopedBinder } from "./binder";
export interface BindingImpl {
    _getBoundValue(context: Context): any;
}
/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
export declare class ScopedBindingImpl implements BindingImpl, ScopedBinder {
    private _identifier;
    private _create;
    private _singleton;
    private _singletonValue;
    private _singletonInitialized;
    private _inScope;
    private _asScope;
    /**
     * A map of scope-defining instances to the instance of this service for that scope.
     */
    private _scopeInstances;
    constructor(_identifier: Identifier, _create: (context: Context) => any, autoBindTarget?: Newable<any>);
    _getBoundValue(context: Context): any;
    inSingletonScope(): void;
    inTransientScope(): void;
    inScope(scope: Scope): void;
    asScope(scope?: Scope): void;
    private _checkCanSetInScope();
}
/**
 * A simple binding that provides a constant value.
 */
export declare class ConstBindingImpl implements BindingImpl {
    private _value;
    constructor(_value: any);
    _getBoundValue(context: Context): any;
}
