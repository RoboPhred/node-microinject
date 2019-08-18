"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuidv4 = require("uuid/v4");
const scope_1 = require("../scope");
const utils_1 = require("../scope/utils");
const utils_2 = require("../injection/utils");
const symbols_1 = require("../scope/symbols");
const utils_3 = require("../utils");
const errors_1 = require("./errors");
const utils_4 = require("./utils");
/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 *
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
class BinderImpl {
    constructor(_primaryIdentifier) {
        this._primaryIdentifier = _primaryIdentifier;
        this._isFinalized = false;
        this._identifiers = [];
        this._bindingId = uuidv4();
        if (_primaryIdentifier == null) {
            throw new TypeError("Identifier must not be null or undefined.");
        }
        this._identifiers.push(_primaryIdentifier);
        const aliases = utils_4.getProvidedIdentifiers(_primaryIdentifier);
        this._identifiers.push(...aliases);
    }
    to(ctor) {
        if (typeof ctor !== "function") {
            throw new TypeError("Target must be a constructor.");
        }
        this._ensureCanBind();
        this._type = "constructor";
        this._ctor = ctor;
        return this;
    }
    toSelf() {
        const ctor = this._primaryIdentifier;
        if (typeof this._primaryIdentifier !== "function") {
            throw new TypeError("Identifier must be a constructor.");
        }
        return this.to(ctor);
    }
    toDynamicValue(factory) {
        if (typeof factory !== "function") {
            throw new TypeError("Factory must be a function.");
        }
        this._ensureCanBind();
        this._type = "factory";
        this._factory = factory;
        return this;
    }
    toConstantValue(value) {
        this._ensureCanBind();
        this._type = "value";
        this._value = value;
    }
    /**
     * Mark the binding as a singleton.  Only one will be created per container.
     */
    inSingletonScope() {
        this._tryAutoBind();
        this._ensureScopeable();
        // Can only be an instance creator from a default binding.
        if (this._createInScope !== undefined) {
            throw new errors_1.BindingConfigurationError("Binding target scope has already been established.");
        }
        this._createInScope = scope_1.SingletonScope;
    }
    /**
     * Mark the binding as transient.  A new object will be created for every request.
     * This overrides any @Singleton() decorator if used on an identifier that would otherwise be auto-bound.
     */
    inTransientScope() {
        this._tryAutoBind();
        this._ensureScopeable();
        // Can only be an instance creator from a default binding.
        if (this._createInScope !== undefined) {
            throw new errors_1.BindingConfigurationError("Binding targetscope has already been established.");
        }
        this._createInScope = null;
    }
    /**
     * Create one instance of the bound service per specified scope.
     * @param scope The scope of the bound service.
     */
    inScope(scope) {
        if (scope == null) {
            throw new TypeError("Scope must be provided.");
        }
        this._tryAutoBind();
        this._ensureScopeable();
        if (this._createInScope !== undefined) {
            throw new errors_1.BindingConfigurationError("Binding target scope has already been established.");
        }
        this._createInScope = scope;
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
        this._tryAutoBind();
        this._ensureScopeable();
        if (this._definesScope !== undefined) {
            throw new errors_1.BindingConfigurationError("Binding scope creation has already been established.");
        }
        this._definesScope = scope;
    }
    _tryAutoBind() {
        if (!this._type) {
            if (typeof this._primaryIdentifier !== "function") {
                throw new errors_1.BindingConfigurationError(`Binding for ${utils_3.identifierToString(this._primaryIdentifier)} was never established.  Auto-binding can only be used on injectable class constructors.`);
            }
            if (utils_2.isInjectable(this._primaryIdentifier)) {
                const ctor = this._primaryIdentifier;
                this.to(ctor);
            }
            else {
                // This condition would throw for container.create(ctor), but we can give a more useful error message by knowing it was an auto-bind.
                throw new errors_1.BindingConfigurationError(`Binding for identifier "${utils_3.identifierToString(this._primaryIdentifier)}" was never established.  Only @Injectable classes may be auto-bound.`);
            }
        }
    }
    _ensureCanBind() {
        if (this._type != null) {
            throw new errors_1.BindingConfigurationError(`Cannot reconfigure binding for ${utils_3.identifierToString(this._primaryIdentifier)}: Binding already established.`);
        }
    }
    _ensureScopeable() {
        if (this._type == null) {
            throw new errors_1.BindingConfigurationError("Cannot scope a binding that has not yet been established.");
        }
        if (this._type === "value") {
            throw new errors_1.BindingConfigurationError("Value bindings cannot be scoped.");
        }
    }
    _finalizeBinding() {
        if (this._isFinalized) {
            return;
        }
        this._isFinalized = true;
        this._tryAutoBind();
        // This will never happen, but we cannot tell typescript that
        //  _ensureOrAutoBind always creates a binding.  Especially as it does it
        //  in an offhand way through .to and .toDynamicValue
        if (!this._type) {
            return;
        }
        // The auto-bind setting source could be multiple things here:
        //  this._identifier if we never had a .to()
        //  this._binding[ctor|factory] if we had a .to() or .toDynamicValue
        // _ensureOrAutoBind will turn the first form into the second, so we just have
        //  to check the binding type to find the auto bind source.
        let autoBindSource;
        switch (this._type) {
            case "constructor": {
                autoBindSource = this._ctor;
                break;
            }
            case "factory": {
                autoBindSource = this._factory;
                break;
            }
            default: {
                autoBindSource = null;
                break;
            }
        }
        // Again we are checking binding.type to make typescript happy.
        //  It will always not be value due to the switch statement above.
        if (autoBindSource && this._type !== "value") {
            if (this._definesScope === undefined) {
                this._definesScope = utils_1.getAsScope(autoBindSource) || null;
            }
            // While we could handle this logic in .asScope(), we still
            //  need it here to support the auto-bind @AsScope() decorator.
            if (this._definesScope === symbols_1.SelfIdentifiedScopeSymbol) {
                this._definesScope = this._primaryIdentifier;
            }
            if (this._createInScope === undefined) {
                this._createInScope = utils_1.getInScope(autoBindSource) || null;
            }
        }
    }
    _getBinding() {
        this._finalizeBinding();
        switch (this._type) {
            case "constructor": {
                const binding = {
                    type: "constructor",
                    identifiers: this._identifiers,
                    bindingId: this._bindingId,
                    ctor: this._ctor,
                    ctorInjections: utils_2.getConstructorInjections(this._ctor),
                    propInjections: utils_2.getPropertyInjections(this._ctor),
                    createInScope: this._createInScope,
                    definesScope: this._definesScope
                };
                return binding;
            }
            case "factory": {
                const binding = {
                    type: "factory",
                    identifiers: this._identifiers,
                    bindingId: this._bindingId,
                    factory: this._factory,
                    createInScope: this._createInScope,
                    definesScope: this._definesScope
                };
                return binding;
            }
            case "value": {
                const binding = {
                    type: "value",
                    identifiers: this._identifiers,
                    bindingId: this._bindingId,
                    value: this._value
                };
                return binding;
            }
        }
        throw new errors_1.BindingConfigurationError(`Unknown binding type "${this._type}".`);
    }
}
exports.BinderImpl = BinderImpl;
//# sourceMappingURL=binder-impl.js.map