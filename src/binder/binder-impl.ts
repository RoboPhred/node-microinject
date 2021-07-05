import uuidv4 = require("uuid/v4");

import { Context, Identifier, Newable } from "../interfaces";

import { Scope, SingletonScope } from "../scope";

import { getAsScope, getInScope } from "../scope/utils";

import {
  getConstructorInjections,
  isInjectable,
  getPropertyInjections,
} from "../injection/utils";

import { SelfIdentifiedScopeSymbol } from "../scope/symbols";

import { identifierToString } from "../utils";

import { BindingConfigurationError } from "./errors";

import { Binder, ScopedBinder } from "./interfaces";

import { getProvidedIdentifiers } from "./utils";

import {
  Binding,
  BindingType,
  FactoryBinding,
  BindingFactoryFunction,
  ConstructorBinding,
  ConstBinding,
} from "./binding";

/**
 * The implementation of the Binder fluent api.
 * This object is created when a binding is created, and will remain indefinitely.
 * When a binding associated with the identifier required, _getBinding() will be called to
 * create the actual binding.
 *
 * Care must be taken to ensure members of this class cannot be called in a contradictory manner.
 */
export class BinderImpl<T = any> implements Binder<T>, ScopedBinder {
  private _isFinalized = false;

  private _identifiers = new Set<Identifier>();
  private _bindingId: string = uuidv4();
  private _type: BindingType | undefined;
  private _ctor: Newable | undefined;
  private _factory: BindingFactoryFunction | undefined;
  private _value: any;
  private _definesScope: Scope | undefined;
  private _createInScope: Scope | undefined;

  constructor(private _primaryIdentifier: Identifier<T>) {
    if (_primaryIdentifier == null) {
      throw new TypeError("Identifier must not be null or undefined.");
    }

    this._identifiers.add(_primaryIdentifier);

    const aliases = getProvidedIdentifiers(_primaryIdentifier);
    aliases.forEach((alias) => this._identifiers.add(alias));
  }

  get identifiers(): Identifier[] {
    return Array.from(this._identifiers);
  }

  to(ctor: Newable): ScopedBinder {
    if (typeof ctor !== "function") {
      throw new TypeError("Target must be a constructor.");
    }
    this._ensureCanBind();
    this._type = "constructor";
    this._ctor = ctor;
    return this;
  }

  toSelf(): ScopedBinder {
    const ctor = this._primaryIdentifier;
    if (typeof this._primaryIdentifier !== "function") {
      throw new TypeError("Identifier must be a constructor.");
    }
    return this.to(ctor as Newable);
  }

  toFactory(factory: (context: Context) => any): ScopedBinder {
    if (typeof factory !== "function") {
      throw new TypeError("Factory must be a function.");
    }
    this._ensureCanBind();

    this._type = "factory";
    this._factory = factory;

    return this;
  }

  toConstantValue(value: any): any {
    this._ensureCanBind();
    this._type = "value";
    this._value = value;
    return this;
  }

  /**
   * Mark the binding as a singleton.  Only one will be created per container.
   */
  inSingletonScope(): any {
    this._tryAutoBind();
    this._ensureScopeable();

    // Can only be an instance creator from a default binding.
    if (this._createInScope !== undefined) {
      throw new BindingConfigurationError(
        "Binding target scope has already been established."
      );
    }
    this._createInScope = SingletonScope;
    return this;
  }

  /**
   * Mark the binding as transient.  A new object will be created for every request.
   * This overrides any @Singleton() decorator if used on an identifier that would otherwise be auto-bound.
   */
  inTransientScope(): any {
    this._tryAutoBind();
    this._ensureScopeable();

    // Can only be an instance creator from a default binding.
    if (this._createInScope !== undefined) {
      throw new BindingConfigurationError(
        "Binding targetscope has already been established."
      );
    }
    this._createInScope = null;
    return this;
  }

  /**
   * Create one instance of the bound service per specified scope.
   * @param scope The scope of the bound service.
   */
  inScope(scope: Scope): any {
    if (scope == null) {
      throw new TypeError("Scope must be provided.");
    }

    this._tryAutoBind();
    this._ensureScopeable();

    if (this._createInScope !== undefined) {
      throw new BindingConfigurationError(
        "Binding target scope has already been established."
      );
    }
    this._createInScope = scope;
    return this;
  }

  /**
   * Mark this service as creating a scope.
   * If scope is not specified, the binding's identifier will be used as the scope identifier.
   * @param scope The optional scope identifier to use.  If not provided, the binding's identifier will be used.
   */
  asScope(scope?: Scope): any {
    if (!scope) {
      scope = SelfIdentifiedScopeSymbol;
    }

    this._tryAutoBind();
    this._ensureScopeable();

    if (this._definesScope !== undefined) {
      throw new BindingConfigurationError(
        "Binding scope creation has already been established."
      );
    }
    this._definesScope = scope;
    return this;
  }

  provides(identifier: Identifier): any {
    this._identifiers.add(identifier);
    return this;
  }

  private _tryAutoBind(): void {
    if (!this._type) {
      if (typeof this._primaryIdentifier !== "function") {
        throw new BindingConfigurationError(
          `Binding for ${identifierToString(
            this._primaryIdentifier
          )} was never established.  Auto-binding can only be used on injectable class constructors.`
        );
      }

      if (isInjectable(this._primaryIdentifier)) {
        const ctor = this._primaryIdentifier as Newable<T>;
        this.to(ctor);
      } else {
        // This condition would throw for container.create(ctor), but we can give a more useful error message by knowing it was an auto-bind.
        throw new BindingConfigurationError(
          `Binding for identifier "${identifierToString(
            this._primaryIdentifier
          )}" was never established.  Only @Injectable classes may be auto-bound.`
        );
      }
    }
  }

  private _ensureCanBind() {
    if (this._type != null) {
      throw new BindingConfigurationError(
        `Cannot reconfigure binding for ${identifierToString(
          this._primaryIdentifier
        )}: Binding already established.`
      );
    }
  }

  private _ensureScopeable() {
    if (this._type == null) {
      throw new BindingConfigurationError(
        "Cannot scope a binding that has not yet been established."
      );
    }
    if (this._type === "value") {
      throw new BindingConfigurationError("Value bindings cannot be scoped.");
    }
  }

  private _finalizeBinding() {
    if (this._isFinalized) {
      return;
    }
    this._isFinalized = true;

    this._tryAutoBind();

    // This will never happen, but we cannot tell typescript that
    //  _ensureOrAutoBind always creates a binding.  Especially as it does it
    //  in an offhand way through .to and .toFactory
    if (!this._type) {
      return;
    }

    // The auto-bind setting source could be multiple things here:
    //  this._identifier if we never had a .to()
    //  this._binding[ctor|factory] if we had a .to() or .toFactory
    // _ensureOrAutoBind will turn the first form into the second, so we just have
    //  to check the binding type to find the auto bind source.
    let autoBindSource: any;
    switch (this._type) {
      case "constructor": {
        autoBindSource = this._ctor!;
        break;
      }
      case "factory": {
        autoBindSource = this._factory!;
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
        this._definesScope = getAsScope(autoBindSource) || null;
      }

      // While we could handle this logic in .asScope(), we still
      //  need it here to support the auto-bind @AsScope() decorator.
      if (this._definesScope === SelfIdentifiedScopeSymbol) {
        this._definesScope = this._primaryIdentifier;
      }

      if (this._createInScope === undefined) {
        this._createInScope = getInScope(autoBindSource) || null;
      }
    }
  }

  _getBinding(): Binding {
    this._finalizeBinding();

    switch (this._type) {
      case "constructor": {
        const binding: ConstructorBinding = {
          type: "constructor",
          identifiers: this.identifiers,
          bindingId: this._bindingId,
          ctor: this._ctor!,
          ctorInjections: getConstructorInjections(this._ctor),
          propInjections: getPropertyInjections(this._ctor),
          createInScope: this._createInScope,
          definesScope: this._definesScope,
        };
        return binding;
      }
      case "factory": {
        const binding: FactoryBinding = {
          type: "factory",
          identifiers: this.identifiers,
          bindingId: this._bindingId,
          factory: this._factory!,
          createInScope: this._createInScope,
          definesScope: this._definesScope,
        };
        return binding;
      }
      case "value": {
        const binding: ConstBinding = {
          type: "value",
          identifiers: this.identifiers,
          bindingId: this._bindingId,
          value: this._value,
        };
        return binding;
      }
    }

    throw new BindingConfigurationError(
      `Unknown binding type "${this._type}".`
    );
  }
}
