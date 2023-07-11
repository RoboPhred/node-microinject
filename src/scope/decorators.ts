import { AutoBindAsScopeKey, AutoBindInScopeKey } from "./symbols";

import { SelfIdentifiedScope, SingletonScope } from "./predefined";

import { Scope } from "./interfaces";

export function singleton<TFunction extends Function>(): (
  target: TFunction
) => void {
  return function (target: any) {
    target[AutoBindInScopeKey] = SingletonScope;
  };
}

export function inScope<TFunction extends Function>(
  scope: Scope
): (target: TFunction) => void {
  if (scope == null) {
    throw new Error("Scope must not be null or undefined.");
  }

  return function (target: any) {
    target[AutoBindInScopeKey] = scope;
  };
}

/**
 * Specify that this object creates a new named scope.
 * @param scope The optional scope identifier to identify the scope created by this object.  If unset, the object will be identified by the identifier of the object.
 */
export function asScope<TFunction extends Function>(
  scope?: Scope
): (target: TFunction) => void {
  if (scope == null) {
    throw new Error("Scope must not be null or undefined.");
  }

  return function (target: any) {
    target[AutoBindAsScopeKey] =
      scope !== undefined ? scope : SelfIdentifiedScope;
  };
}
