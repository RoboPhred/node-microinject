import { Context, Identifier, Newable } from "../interfaces";
import { Scope } from "../scope";
import { Binder, ScopedBinder } from "./interfaces";
import { Binding } from "./binding";
/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 *
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
export declare class BinderImpl<T = any> implements Binder<T>, ScopedBinder {
    private _identifier;
    private _binding;
    private _isFinalized;
    constructor(_identifier: Identifier<T>);
    to(ctor: Newable): ScopedBinder;
    toSelf(): ScopedBinder;
    toDynamicValue(factory: (context: Context) => any): ScopedBinder;
    toConstantValue(value: any): void;
    /**
     * Mark the binding as a singleton.  Only one will be created per container.
     */
    inSingletonScope(): void;
    /**
     * Mark the binding as transient.  A new object will be created for every request.
     * This overrides any @Singleton() decorator if used on an identifier that would otherwise be auto-bound.
     */
    inTransientScope(): void;
    /**
     * Create one instance of the bound service per specified scope.
     * @param scope The scope of the bound service.
     */
    inScope(scope: Scope): void;
    /**
     * Mark this service as creating a scope.
     * If scope is not specified, the binding's identifier will be used as the scope identifier.
     * @param scope The optional scope identifier to use.  If not provided, the binding's identifier will be used.
     */
    asScope(scope?: Scope): void;
    private _tryAutoBind();
    private _ensureScopeable();
    private _finalizeBinding();
    private _ensureCanBind();
    _getBinding(): Binding;
}
