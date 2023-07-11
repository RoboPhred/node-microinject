import { provides } from "../binder";

import { Identifier } from "../interfaces";
import { Scope } from "../scope";

import {
  IdentifierInjectionOptions,
  ParameterInjectionOptions,
} from "./interfaces";

import {
  ClassIsInjectableKey,
  ConstructorInjectionsKey,
  PropertyInjectionsKey,
} from "./symbols";

import {
  InjectionData,
  ParameterInjectionData,
  IdentifierInjectionData,
  ScopeInjectionData,
} from "./utils";

/**
 * Marks this class as injectable.
 * Injectable classes can be injected by a container into injectables.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for `@injectable() @provides(identifier)`.
 */
export function injectable<TFunction extends Function>(
  identifier?: Identifier
): (target: TFunction) => void {
  return function (target: any) {
    target[ClassIsInjectableKey] = true;
    if (identifier) {
      provides(identifier)(target);
    }
  };
}

function getInjectionTargetData(
  target: any,
  targetKey: string | symbol | undefined,
  index?: number
): InjectionData {
  if (targetKey === undefined && index != null) {
    // Constructor arguments
    let dependencies: InjectionData[];
    if (
      Object.prototype.hasOwnProperty.call(target, ConstructorInjectionsKey)
    ) {
      dependencies = target[ConstructorInjectionsKey] as InjectionData[];
    } else {
      dependencies = [];
      target[ConstructorInjectionsKey] = dependencies;
    }
    if (dependencies[index] == null) {
      dependencies[index] = {} as InjectionData;
    }
    return dependencies[index];
  } else if (targetKey) {
    // Properties
    let properties = target[PropertyInjectionsKey] as Map<
      string | symbol,
      InjectionData
    >;
    if (properties == null) {
      properties = new Map();
      target[PropertyInjectionsKey] = properties;
    }
    let data = properties.get(targetKey);
    if (!data) {
      data = {} as InjectionData;
      properties.set(targetKey, data);
    }
    return data;
  } else {
    throw new Error("Invalid injection target");
  }
}

/**
 * Marks a constructor argument or object property as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export function inject(
  identifier: Identifier,
  opts?: IdentifierInjectionOptions
) {
  return function (
    target: any,
    targetKey: string | symbol | undefined,
    index?: number
  ) {
    if (identifier == null) {
      throw new Error("Identifier must not be null or undefined.");
    }

    const data = getInjectionTargetData(target, targetKey, index);
    Object.assign(data, opts, {
      type: "identifier",
      identifier,
    } as IdentifierInjectionData);
  };
}

/**
 * Marks a constructor argument or object property as receiving a param when created from `ServiceLocator.create()`.
 * @param paramName The identifier of the parameter to use.
 */
export function injectParam(
  paramKey: string | number | symbol,
  opts?: ParameterInjectionOptions
) {
  return function (
    target: any,
    targetKey: string | symbol | undefined,
    index?: number
  ) {
    if (paramKey == null) {
      throw new Error("Param must not be null or undefined.");
    }

    const data = getInjectionTargetData(target, targetKey, index);
    Object.assign(data, opts, {
      type: "parameter",
      paramKey: paramKey,
    } as ParameterInjectionData);
  };
}

/**
 * Marks an object property as receiving a scope provider object.
 * Because the scope must be fully constructed to be injected, this can only be done to an object property.
 * @param paramName The identifier of the parameter to use.
 */
export function injectScope(scope: Scope) {
  return function (
    target: any,
    targetKey: string | symbol | undefined,
    index?: number
  ) {
    if (scope == null) {
      throw new Error("Scope must not be null or undefined.");
    }

    const data = getInjectionTargetData(target, targetKey, index);
    Object.assign(data, {
      type: "scope",
      scope,
    } as ScopeInjectionData);
  };
}
