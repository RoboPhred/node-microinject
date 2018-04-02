"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
function getSymbol(id) {
    return symbols_1.getSymbol(`/binder/${id}`);
}
/**
 * Metadata identifier for a value indicating if this
 * object is an auto-binding function.
 */
exports.AutobindAsFactoryKey = getSymbol("AutobindAsFactory");
/**
 * Metadata identifier for an array of identifiers that this
 * object should be bound as.
 */
exports.AutobindIdentifiersKey = getSymbol("AutobindIdentifiers");
//# sourceMappingURL=symbols.js.map