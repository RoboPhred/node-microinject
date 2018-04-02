"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * Indicates an error that occured while resolving a dependency.
 */
class DependencyResolutionError extends Error {
    constructor(identifier, path, message) {
        message = `Failed to resolve value for identifier "${utils_1.identifierToString(identifier)}"${message ? ": " + message : "."}`;
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
//# sourceMappingURL=errors.js.map