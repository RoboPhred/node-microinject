"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IdentifierNotBoundError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, IdentifierNotBoundError.prototype);
        this.message = message;
    }
}
exports.IdentifierNotBoundError = IdentifierNotBoundError;
class BindingConfigurationError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, BindingConfigurationError.prototype);
        this.message = message;
    }
}
exports.BindingConfigurationError = BindingConfigurationError;
