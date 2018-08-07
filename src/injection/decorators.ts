import { provides } from "../binder";

import { Identifier } from "../interfaces";

import { InjectionOptions } from "./interfaces";

import {
  ClassIsInjectableKey,
  ConstructorInjectionsKey,
  PropertyInjectionsKey
} from "./symbols";

import { InjectionData } from "./utils";

/**
 * Marks this class as injectable.
 * Injectable classes can be injected by a container into injectables.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for `@injectable() @provides(identifier)`.
 */
export function injectable<TFunction extends Function>(
  identifier?: Identifier
): (target: TFunction) => void {
  return function(target: any) {
    target[ClassIsInjectableKey] = true;
    if (identifier) {
      provides(identifier)(target);
    }
  };
}

function getInjectionTargetData(
  target: any,
  targetKey: string | symbol,
  index?: number
): InjectionData {
  if (index != null) {
    // Constructor arguments
    let dependencies = target[ConstructorInjectionsKey] as InjectionData[];
    if (dependencies == null) {
      dependencies = [];
      target[ConstructorInjectionsKey] = dependencies;
    }
    if (dependencies[index] == null) {
      dependencies[index] = {} as InjectionData;
    }
    return dependencies[index];
  } else {
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
  }
}

/**
 * Marks a constructor argument or object propertie as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export function inject(identifier: Identifier, opts?: InjectionOptions) {
  return function(target: any, targetKey: string | symbol, index?: number) {
    const data = getInjectionTargetData(target, targetKey, index);
    Object.assign(data, opts, {
      identifier
    });
  };
}

/**
 * Marks a constructor argument or object property as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
export function optional() {
  return function(target: any, targetKey: string, index?: number) {
    const data = getInjectionTargetData(target, targetKey, index);
    data.optional = true;
  };
}

/**
 * Marks a constructor argument or object property as receiving all injectable values.
 * The target value will be set to an array of all registered objects.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
export function all() {
  return function(target: any, targetKey: string, index?: number) {
    const data = getInjectionTargetData(target, targetKey, index);
    data.all = true;
  };
}
