"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function Singleton() {
    return function (target) {
        target[symbols_1.SingletonSymbol] = true;
    };
}
exports.Singleton = Singleton;
function InScope(scope) {
    return function (target) {
        target[symbols_1.InScopeSymbol] = scope;
    };
}
exports.InScope = InScope;
function AsScope(scope) {
    return function (target) {
        target[symbols_1.AsScopeSymbol] = scope;
    };
}
exports.AsScope = AsScope;
//# sourceMappingURL=scopes.js.map