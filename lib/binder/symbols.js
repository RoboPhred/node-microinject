"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
function getSymbol(id) {
    return symbols_1.getSymbol(`/binder/${id}`);
}
exports.AutobindAsFactoryKey = getSymbol("IsAutoBindFactory");
exports.AutobindIdentifiersKey = getSymbol("AutobindIdentifier");
//# sourceMappingURL=symbols.js.map