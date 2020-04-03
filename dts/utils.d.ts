import { Identifier } from "./interfaces";
import { Scope } from "./scope";
/**
 * Returns a string representation of the identifier.
 * @param identifier The identifier to stringify.
 */
export declare function identifierToString(identifier: Identifier): string;
/**
 * Returns a string representation of the scope.
 * @param scope The scope to stringify.
 */
export declare function scopeToString(scope: Scope): string;
export declare function has(obj: any, key: string | symbol): boolean;
