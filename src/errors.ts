import { Identifier } from "./interfaces";
import { Scope } from "./scope";

import { identifierToString, scopeToString } from "./utils";

/**
 * Indicates an error that occured while resolving a dependency.
 */
export class DependencyResolutionError extends Error {
  /**
   * The error code.
   */
  code: string;

  /**
   * The identifier that failed to resolve.
   */
  identifier: Identifier;

  /**
   * The path from the root requested object to the failing identifier.
   */
  path: Identifier[];

  constructor(identifier: Identifier, path: Identifier[], message?: string) {
    message = `Failed to resolve value for identifier "${identifierToString(
      identifier
    )}"${message ? ": " + message : "."}`;
    super(message);
    Object.setPrototypeOf(this, DependencyResolutionError.prototype);
    this.identifier = identifier;
    this.path = path;
    this.message = message;
    this.name = "DependencyResolutionError";
    this.code = "DEPENDENCY_RESOLUTION_FAILED";
  }
}

/**
 * Indicates a parameter injection failed to resolve.
 */
export class ParameterNotSuppliedError extends Error {
  /**
   * The error code.
   */
  code: string;

  /**
   * The parameter key that failed to resolve.
   */
  paramKey: string | symbol;

  /**
   * The path from the root requested object to the failing identifier.
   */
  path: Identifier[];

  constructor(paramKey: string | symbol, path: Identifier[], message?: string) {
    message = `Failed to resolve value for parameter "${identifierToString(
      paramKey
    )}"${message ? ": " + message : "."}`;
    super(message);
    Object.setPrototypeOf(this, ParameterNotSuppliedError.prototype);
    this.paramKey = paramKey;
    this.path = path;
    this.message = message;
    this.name = "ParameterNotSuppliedError";
    this.code = "PARAMETER_RESOLUTION_FAILED";
  }
}

export class ScopeNotFoundError extends Error {
  /**
   * The error code.
   */
  code: string;

  /**
   * The missing scope.
   */
  scope: Scope;

  /**
   * The path from the root requested object to the failing identifier.
   */
  path: Identifier[];

  constructor(scope: any, path: Identifier[], message?: string) {
    message = `Failed to resolve value for parameter "${scopeToString(scope)}"${
      message ? ": " + message : "."
    }`;
    super(message);
    Object.setPrototypeOf(this, ScopeNotFoundError.prototype);
    this.scope = scope;
    this.path = path;
    this.message = message;
    this.name = "ScopeNotFoundError";
    this.code = "SCOPE_RESOLUTION_FAILED";
  }
}
