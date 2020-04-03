import { Identifier } from "./interfaces";

import { identifierToString } from "./utils";

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

  constructor(paramKey: string | symbol, message?: string) {
    message = `Failed to resolve value for parameter "${identifierToString(
      paramKey
    )}"${message ? ": " + message : "."}`;
    super(message);
    Object.setPrototypeOf(this, ParameterNotSuppliedError.prototype);
    this.paramKey = paramKey;
    this.message = message;
    this.name = "ParameterNotSuppliedError";
    this.code = "PARAMETER_RESOLUTION_FAILED";
  }
}
