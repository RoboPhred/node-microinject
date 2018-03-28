"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
/**
 * Marks the function as a factory function when auto-binding.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
function Factory(identifier) {
    return function (target) {
        target[symbols_1.IsAutoBindFactorySymbol] = true;
        if (identifier) {
            if (target[symbols_1.AutobindIdentifierSymbol] == null)
                target[symbols_1.AutobindIdentifierSymbol] = [];
            target[symbols_1.AutobindIdentifierSymbol].push(identifier);
        }
    };
}
exports.Factory = Factory;
/**
 * Specify that the given constructor or function provides the given identifier.
 * This is used when auto-binding is invoked by passing the object directly as the identifier.
 * This decorator can be used more than once to mark the object as providing multiple services.
 * @param identifier The identifier to automatically bind this class to when bound without additional configuration.
 */
function Provides(identifier) {
    return function (target) {
        if (target[symbols_1.AutobindIdentifierSymbol] == null)
            target[symbols_1.AutobindIdentifierSymbol] = [];
        target[symbols_1.AutobindIdentifierSymbol].push(identifier);
    };
}
exports.Provides = Provides;
//# sourceMappingURL=decorators.js.map