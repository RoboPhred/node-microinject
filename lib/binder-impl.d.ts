import { Identifier, Newable, Context } from "./interfaces";
import { Binder, ScopedBinder } from "./binder";
import { BindingImpl } from "./binding-impl";
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
    toDynamicValue<T>(factory: (context: Context) => T): ScopedBinder;
    toConstantValue<T>(value: T): void;
    _getBinding(): BindingImpl;
    private _createDefaultBinding();
    private _ensureCanBind();
}
