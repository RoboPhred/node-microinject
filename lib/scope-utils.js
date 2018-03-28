"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function getInScope(target) {
    return target[symbols_1.InScopeSymbol];
}
exports.getInScope = getInScope;
function getAsScope(target) {
    return target[symbols_1.AsScopeSymbol];
}
exports.getAsScope = getAsScope;
//# sourceMappingURL=scope-utils.js.map