
import {
    Identifier,
    Newable,
    Context,
    ServiceFactory
} from "../interfaces";

import {
    Scope,
    SingletonScope
} from "../scope";

import {
    getInScope,
    getAsScope
} from "../scope/utils";

import {
    isInjectable,
    getConstructorInjections
} from "../injection/utils";

import {
    SelfIdentifiedScopeSymbol
} from "../scope/symbols";


import {
    identifierToString
} from "../utils";

import {
    BindingConfigurationError
} from "./errors";

import {
    Binder,
    ScopedBinder
} from "./interfaces";

import {
    isAutoBindFactory
} from "./utils";

import {
    InstanceCreatorBindingData,
    BindingData,
    ConstBindingData,
    FactoryBindingData,
    ConstructorBindingData,
    BindingDataType, 
} from "./data";


/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 * 
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
export class BinderImpl<T = any> implements Binder<T>, ScopedBinder {

    private _binding: BindingData | null = null;
    private _isFinalized = false;

    constructor(private _identifier: Identifier<T>) {}

    to<N extends T>(ctor: Newable<N>): ScopedBinder {
        if (typeof ctor !== "function") {
            throw new TypeError("Target must be a constructor.");
        }
        this._ensureCanBind();
        this._binding = {
            type: "constructor",
            ctor,
            injections: getConstructorInjections(ctor)
        };

        return this;
    }

    toDynamicValue<N extends T>(factory: (context: Context) => N): ScopedBinder {      
        if (typeof factory !== "function") {
            throw new TypeError("Factory must be a function.");
        }
        this._ensureCanBind();

        this._binding = {
            type: "factory",
            factory
        };

        return this;
    }

    toConstantValue<N extends T>(value: N): void {
        this._ensureCanBind();
        this._binding = {
            type: "value",
            value
        };
    }

    /**
     * Mark the binding as a singleton.  Only one will be created per container.
     */
    inSingletonScope(): void {
        this._tryAutoBind();
        this._ensureScopeable();

        // Can only be an instance creator from a default binding.
        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.createInScope !== undefined) throw new BindingConfigurationError("Binding target scope has already been established.");
        binding.createInScope = SingletonScope;
    }

    /**
     * Mark the binding as transient.  A new object will be created for every request.
     * This overrides any @Singleton() decorator if used on an identifier that would otherwise be auto-bound.
     */
    inTransientScope(): void {
        this._tryAutoBind();
        this._ensureScopeable();

        // Can only be an instance creator from a default binding.
        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.createInScope !== undefined) throw new BindingConfigurationError("Binding targetscope has already been established.");
        binding.createInScope = null;
    }

    /**
     * Create one instance of the bound service per specified scope.
     * @param scope The scope of the bound service.
     */
    inScope(scope: Scope): void {
        if (scope == null) {
            throw new TypeError("Scope must be provided.");
        }

        this._tryAutoBind();
        this._ensureScopeable();

        // Can only be an instance creator from a default binding.
        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.createInScope !== undefined) throw new BindingConfigurationError("Binding target scope has already been established.");
        binding.createInScope = scope;
    }

    /**
     * Mark this service as creating a scope.
     * If scope is not specified, the binding's identifier will be used as the scope identifier.
     * @param scope The optional scope identifier to use.  If not provided, the binding's identifier will be used.
     */
    asScope(scope?: Scope): void {
        if (!scope) {
            scope = SelfIdentifiedScopeSymbol;
        }

        this._tryAutoBind();
        this._ensureScopeable();

        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.definesScope !== undefined) throw new BindingConfigurationError("Binding scope creation has already been established.");
        binding.definesScope = scope;
    }

    private _tryAutoBind(): void {
        if (!this._binding) {
            if (typeof this._identifier !== "function") {
                throw new BindingConfigurationError(`Binding for ${identifierToString(this._identifier)} was never established.  Auto-binding can only be used on injectable class constructors.`);
            }
            
            if (isInjectable(this._identifier)) {
                const ctor = this._identifier as Newable<T>;
                this.to(ctor);
            }
            else if (isAutoBindFactory(this._identifier)) {
                const factory = this._identifier as ServiceFactory;
                this.toDynamicValue(factory);
            }
            else {
                // This condition would throw for container.create(ctor), but we can give a more useful error message by knowing it was an auto-bind.
                throw new BindingConfigurationError(`Binding for identifier "${identifierToString(this._identifier)}" was never established.  Only @Factory functions or @Injectable classes may be auto-bound.`);
            }
        }
    }

    private _ensureScopeable() {
        if (!this._binding || this._binding.type === "value") {
            throw new BindingConfigurationError("Value bindings cannot be scoped.");
        }
    }

    private _finalizeBinding() {
        if (this._isFinalized) return;
        this._isFinalized = true;
        
        this._tryAutoBind();

        // This will never happen, but we cannot tell typescript that
        //  _ensureOrAutoBind always creates a binding.  Especially as it does it
        //  in an offhand way through .to and .toDynamicValue
        if (!this._binding) return;

        // The auto-bind setting source could be multiple things here:
        //  this._identifier if we never had a .to()
        //  this._binding[ctor|factory] if we had a .to() or .toDynamicValue
        // _ensureOrAutoBind will turn the first form into the second, so we just have
        //  to check the binding type to find the auto bind source.
        let autoBindSource: any;
        switch(this._binding.type) {
            case "constructor": {
                autoBindSource = this._binding.ctor;
            }; break;
            case "factory": {
                autoBindSource = this._binding.factory;
            }; break;
            default: {
                autoBindSource = null;
            }; break;
        }

        // Again we are checking binding.type to make typescript happy.
        //  It will always not be value due to the switch statement above.
        if (autoBindSource && this._binding.type !== "value") {
            if (this._binding.definesScope === undefined) {
                this._binding.definesScope = getAsScope(autoBindSource) || null;
            }

            // While we could handle this logic in .asScope(), we still
            //  need it here to support the auto-bind @AsScope() decorator.
            if (this._binding.definesScope === SelfIdentifiedScopeSymbol) {
                this._binding.definesScope = this._identifier;
            }

            if (this._binding.createInScope === undefined) this._binding.createInScope = getInScope(autoBindSource) || null;
        }
    }

    private _ensureCanBind() {
        if (this._binding != null) {
            throw new BindingConfigurationError(`Cannot reconfigure binding for ${identifierToString(this._identifier)}: Binding already established.`);
        }
    }


    // TODO: It may be desirable to find a way of removing access to this from outside the library.
    _getBinding(): BindingData {
        this._finalizeBinding();
        return this._binding!;
    }
}
