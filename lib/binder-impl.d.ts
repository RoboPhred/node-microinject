import { Identifier, Newable, Context } from "./interfaces";
import { Binder, ScopedBinder } from "./binder";
import { Container } from "./container";
/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 *
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
export declare class BinderImpl<T = any> implements Binder {
    private _identifier;
    private _binding;
    constructor(_identifier: Identifier<T>);
    to<T>(ctor: Newable<T>): ScopedBinder;
    toFactory<T>(factory: (context: Context) => T): ScopedBinder;
    toDynamicValue<T>(factory: (context: Context) => T): ScopedBinder;
    toConstantValue<T>(value: T): void;
    _getBinding(): BindingImpl;
    private _createDefaultBinding();
    private _ensureCanBind();
}
export declare abstract class BindingImpl {
    abstract _getBoundValue(context: Context): any;
}
/**
 * A binding that is aware of scoping.
 * Currently, this is limited to the global singleton scope.
 */
export declare class ScopedBindingImpl extends BindingImpl implements ScopedBinder {
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
export declare class ConstBindingImpl extends BindingImpl {
    private _value;
    constructor(_value: any);
    _getBoundValue(context: Context): any;
}
