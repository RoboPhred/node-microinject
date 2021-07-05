import { Identifier } from "./interfaces";

import { Scope } from "./scope";

/**
 * Returns a string representation of the identifier.
 * @param identifier The identifier to stringify.
 */
export function identifierToString(identifier: Identifier): string {
  if (typeof identifier === "symbol") {
    return String(identifier);
  }

  if (typeof identifier === "function") {
    return identifier.name;
  }

  return String(identifier);
}

/**
 * Returns a string representation of the scope.
 * @param scope The scope to stringify.
 */
export function scopeToString(scope: Scope): string {
  return String(scope);
}

export function has(obj: any, key: string | symbol) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
