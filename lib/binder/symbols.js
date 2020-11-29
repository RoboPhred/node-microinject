"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutobindIdentifiersKey = void 0;
const symbols_1 = require("../symbols");
function getSymbol(id) {
    return symbols_1.getSymbol(`/binder/${id}`);
}
/**
 * Metadata identifier for an array of identifiers that this
 * object should be bound as.
 */
exports.AutobindIdentifiersKey = getSymbol("AutobindIdentifiers");
//# sourceMappingURL=symbols.js.map