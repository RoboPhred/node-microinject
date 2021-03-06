"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Indicates an error while performing binding configuration.
 */
class BindingConfigurationError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, BindingConfigurationError.prototype);
        this.message = message;
    }
}
exports.BindingConfigurationError = BindingConfigurationError;
//# sourceMappingURL=errors.js.map