"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
/**
 * Specify that the given constructor or function provides the given identifier.
 * This is used when auto-binding is invoked by passing the object directly as the identifier.
 * This decorator can be used more than once to mark the object as providing multiple services.
 * @param identifier The identifier to automatically bind this class to when bound without additional configuration.
 */
function provides(identifier) {
    if (identifier == null) {
        throw new Error("Identifier must not be null or undefined.");
    }
    return function (target) {
        if (target[symbols_1.AutobindIdentifiersKey] == null) {
            target[symbols_1.AutobindIdentifiersKey] = [];
        }
        target[symbols_1.AutobindIdentifiersKey].push(identifier);
    };
}
exports.provides = provides;
//# sourceMappingURL=decorators.js.map