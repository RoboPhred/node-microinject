import { Context, Identifier, Newable } from "../interfaces";
import { Scope } from "../scope";
import { Binder, ScopedBinder, ConfiguredBinder } from "./interfaces";
import { Binding } from "./binding";
/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 *
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
export declare class BinderImpl<T = any> implements Binder<T>, ScopedBinder, ConfiguredBinder {
    private _primaryIdentifier;
    private _isFinalized;
    private _identifiers;
    private _bindingId;
    private _type;
    private _ctor;
    private _factory;
    private _value;
    private _definesScope;
    private _createInScope;
    constructor(_primaryIdentifier: Identifier<T>);
    readonly identifiers: Identifier[];
    to(ctor: Newable): ScopedBinder;
    toSelf(): ScopedBinder;
    toDynamicValue(factory: (context: Context) => any): ScopedBinder;
    toConstantValue(value: any): any;
    /**
     * Mark the binding as a singleton.  Only one will be created per container.
     */
    inSingletonScope(): any;
    /**
     * Mark the binding as transient.  A new object will be created for every request.
     * This overrides any @Singleton() decorator if used on an identifier that would otherwise be auto-bound.
     */
    inTransientScope(): any;
    /**
     * Create one instance of the bound service per specified scope.
     * @param scope The scope of the bound service.
     */
    inScope(scope: Scope): any;
    /**
     * Mark this service as creating a scope.
     * If scope is not specified, the binding's identifier will be used as the scope identifier.
     * @param scope The optional scope identifier to use.  If not provided, the binding's identifier will be used.
     */
    asScope(scope?: Scope): any;
    provides(identifier: Identifier): any;
    private _tryAutoBind;
    private _ensureCanBind;
    private _ensureScopeable;
    private _finalizeBinding;
    _getBinding(): Binding;
}
