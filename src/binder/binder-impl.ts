
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
import { SelfIdentifiedScopeSymbol } from "../scope/symbols";


/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 * 
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
export class BinderImpl<T = any> implements Binder, ScopedBinder {

    private _binding: BindingData | null = null;
    private _isFinalized = false;

    constructor(private _identifier: Identifier<T>) {}

    to<T>(ctor: Newable<T>): ScopedBinder {
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

    toDynamicValue<T>(factory: (context: Context) => T): ScopedBinder {      
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

    toConstantValue<T>(value: T): void {
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
        this._ensureBoundOrBinding();

        // Can only be an instance creator from a default binding.
        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.inScope !== undefined) throw new BindingConfigurationError("Binding target scope has already been established.");
        binding.inScope = SingletonScope;
    }

    /**
     * Mark the binding as transient.  A new object will be created for every request.
     * This overrides any @Singleton() decorator if used on an identifier that would otherwise be auto-bound.
     */
    inTransientScope(): void {
        this._ensureBoundOrBinding();

        // Can only be an instance creator from a default binding.
        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.inScope !== undefined) throw new BindingConfigurationError("Binding targetscope has already been established.");
        binding.inScope = null;
    }

    /**
     * Create one instance of the bound service per specified scope.
     * @param scope The scope of the bound service.
     */
    inScope(scope: Scope): void {
        if (scope == null) {
            throw new TypeError("Scope must be provided.");
        }

        this._ensureBoundOrBinding();

        // Can only be an instance creator from a default binding.
        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.inScope !== undefined) throw new BindingConfigurationError("Binding target scope has already been established.");
        binding.inScope = scope;
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

        this._ensureBoundOrBinding();

        const binding = this._binding as InstanceCreatorBindingData;
        if (binding.defineScope !== undefined) throw new BindingConfigurationError("Binding scope creation has already been established.");
        binding.defineScope = scope;
    }

    private _ensureBoundOrBinding(): void {
        if (!this._binding) {
            if (typeof this._identifier !== "function") {
                throw new BindingConfigurationError(`Binding for ${this._identifier} was never established.  Auto-binding can only be used on injectable class constructors.`);
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

    private _finalizeBinding() {
        if (this._isFinalized) return;
        this._isFinalized = true;
        
        this._ensureBoundOrBinding();

        // this._binding will always be set here, but typescript cannot infer that from our setup above.
        if (this._binding && this._binding.type !== "value") {
            if (this._binding.defineScope === undefined) {
                this._binding.defineScope = getAsScope(this._identifier);
            }

            // While we could handle this logic in .asScope(), we still
            //  need it here to support the auto-bind @AsScope() decorator.
            if (this._binding.defineScope === SelfIdentifiedScopeSymbol) {
                this._binding.defineScope = this._identifier;
            }

            if (this._binding.inScope === undefined) this._binding.inScope = getInScope(this._identifier);
        }
    }

    private _ensureCanBind() {
        if (this._binding != null) {
            throw new BindingConfigurationError(`Cannot reconfigure binding for ${this._identifier}: Binding already established.`);
        }
    }


    // TODO: It may be desirable to find a way of removing access to this from outside the library.
    _getBinding(): BindingData {
        this._finalizeBinding();
        return this._binding!;
    }
}
