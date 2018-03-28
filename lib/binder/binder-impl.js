"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("../scope");
const utils_1 = require("../scope/utils");
const utils_2 = require("../injection/utils");
const utils_3 = require("../utils");
const errors_1 = require("./errors");
const utils_4 = require("./utils");
const symbols_1 = require("../scope/symbols");
/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 *
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
class BinderImpl {
    constructor(_identifier) {
        this._identifier = _identifier;
        this._binding = null;
        this._isFinalized = false;
    }
    to(ctor) {
        if (typeof ctor !== "function") {
            throw new TypeError("Target must be a constructor.");
        }
        this._ensureCanBind();
        this._binding = {
            type: "constructor",
            ctor,
            injections: utils_2.getConstructorInjections(ctor)
        };
        return this;
    }
    toDynamicValue(factory) {
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
    toConstantValue(value) {
        this._ensureCanBind();
        this._binding = {
            type: "value",
            value
        };
    }
    /**
     * Mark the binding as a singleton.  Only one will be created per container.
     */
    inSingletonScope() {
        this._ensureBoundOrBinding();
        // Can only be an instance creator from a default binding.
        const binding = this._binding;
        if (binding.inScope !== undefined)
            throw new errors_1.BindingConfigurationError("Binding target scope has already been established.");
        binding.inScope = scope_1.SingletonScope;
    }
    /**
     * Mark the binding as transient.  A new object will be created for every request.
     * This overrides any @Singleton() decorator if used on an identifier that would otherwise be auto-bound.
     */
    inTransientScope() {
        this._ensureBoundOrBinding();
        // Can only be an instance creator from a default binding.
        const binding = this._binding;
        if (binding.inScope !== undefined)
            throw new errors_1.BindingConfigurationError("Binding targetscope has already been established.");
        binding.inScope = null;
    }
    /**
     * Create one instance of the bound service per specified scope.
     * @param scope The scope of the bound service.
     */
    inScope(scope) {
        if (scope == null) {
            throw new TypeError("Scope must be provided.");
        }
        this._ensureBoundOrBinding();
        // Can only be an instance creator from a default binding.
        const binding = this._binding;
        if (binding.inScope !== undefined)
            throw new errors_1.BindingConfigurationError("Binding target scope has already been established.");
        binding.inScope = scope;
    }
    /**
     * Mark this service as creating a scope.
     * If scope is not specified, the binding's identifier will be used as the scope identifier.
     * @param scope The optional scope identifier to use.  If not provided, the binding's identifier will be used.
     */
    asScope(scope) {
        if (!scope) {
            scope = symbols_1.SelfIdentifiedScopeSymbol;
        }
        this._ensureBoundOrBinding();
        const binding = this._binding;
        if (binding.defineScope !== undefined)
            throw new errors_1.BindingConfigurationError("Binding scope creation has already been established.");
        binding.defineScope = scope;
    }
    _ensureBoundOrBinding() {
        if (!this._binding) {
            if (typeof this._identifier !== "function") {
                throw new errors_1.BindingConfigurationError(`Binding for ${this._identifier} was never established.  Auto-binding can only be used on injectable class constructors.`);
            }
            if (utils_2.isInjectable(this._identifier)) {
                const ctor = this._identifier;
                this.to(ctor);
            }
            else if (utils_4.isAutoBindFactory(this._identifier)) {
                const factory = this._identifier;
                this.toDynamicValue(factory);
            }
            else {
                // This condition would throw for container.create(ctor), but we can give a more useful error message by knowing it was an auto-bind.
                throw new errors_1.BindingConfigurationError(`Binding for identifier "${utils_3.identifierToString(this._identifier)}" was never established.  Only @Factory functions or @Injectable classes may be auto-bound.`);
            }
        }
    }
    _finalizeBinding() {
        if (this._isFinalized)
            return;
        this._isFinalized = true;
        this._ensureBoundOrBinding();
        // this._binding will always be set here, but typescript cannot infer that from our setup above.
        if (this._binding && this._binding.type !== "value") {
            if (this._binding.defineScope === undefined) {
                this._binding.defineScope = utils_1.getAsScope(this._identifier);
            }
            // While we could handle this logic in .asScope(), we still
            //  need it here to support the auto-bind @AsScope() decorator.
            if (this._binding.defineScope === symbols_1.SelfIdentifiedScopeSymbol) {
                this._binding.defineScope = this._identifier;
            }
            if (this._binding.inScope === undefined)
                this._binding.inScope = utils_1.getInScope(this._identifier);
        }
    }
    _ensureCanBind() {
        if (this._binding != null) {
            throw new errors_1.BindingConfigurationError(`Cannot reconfigure binding for ${this._identifier}: Binding already established.`);
        }
    }
    // TODO: It may be desirable to find a way of removing access to this from outside the library.
    _getBinding() {
        this._finalizeBinding();
        return this._binding;
    }
}
exports.BinderImpl = BinderImpl;
//# sourceMappingURL=binder-impl.js.map