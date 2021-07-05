"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * Indicates an error that occured while resolving a dependency.
 */
class DependencyResolutionError extends Error {
    constructor(identifier, path, message) {
        const identifierPath = [...path, identifier]
            .map(utils_1.identifierToString)
            .join(" => ");
        message = `Failed to resolve value for identifier ${identifierPath}${message ? ": " + message : "."}`;
        super(message);
        Object.setPrototypeOf(this, DependencyResolutionError.prototype);
        this.identifier = identifier;
        this.path = path;
        this.message = message;
        this.name = "DependencyResolutionError";
        this.code = "DEPENDENCY_RESOLUTION_FAILED";
    }
}
exports.DependencyResolutionError = DependencyResolutionError;
/**
 * Indicates a parameter injection failed to resolve.
 */
class ParameterNotSuppliedError extends Error {
    constructor(paramKey, path, message) {
        message = `Failed to resolve value for parameter "${utils_1.identifierToString(paramKey)}"${message ? ": " + message : "."}`;
        super(message);
        Object.setPrototypeOf(this, ParameterNotSuppliedError.prototype);
        this.paramKey = paramKey;
        this.path = path;
        this.message = message;
        this.name = "ParameterNotSuppliedError";
        this.code = "PARAMETER_RESOLUTION_FAILED";
    }
}
exports.ParameterNotSuppliedError = ParameterNotSuppliedError;
class ScopeNotFoundError extends Error {
    constructor(scope, path, message) {
        message = `Failed to resolve value for parameter "${utils_1.scopeToString(scope)}"${message ? ": " + message : "."}`;
        super(message);
        Object.setPrototypeOf(this, ScopeNotFoundError.prototype);
        this.scope = scope;
        this.path = path;
        this.message = message;
        this.name = "ScopeNotFoundError";
        this.code = "SCOPE_RESOLUTION_FAILED";
    }
}
exports.ScopeNotFoundError = ScopeNotFoundError;
//# sourceMappingURL=errors.js.map