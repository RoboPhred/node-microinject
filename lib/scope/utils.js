"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsScope = exports.getInScope = void 0;
const symbols_1 = require("./symbols");
function getInScope(target) {
    return target[symbols_1.AutoBindInScopeKey];
}
exports.getInScope = getInScope;
function getAsScope(target) {
    return target[symbols_1.AutoBindAsScopeKey];
}
exports.getAsScope = getAsScope;
//# sourceMappingURL=utils.js.map