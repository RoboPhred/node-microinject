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
/**
 * Specify that this object creates a new named scope.
 * @param scope The optional scope identifier to identify the scope created by this object.  If unset, the object will be identified by the identifier of the object.
 */
function AsScope(scope) {
    return function (target) {
        target[symbols_1.AsScopeSymbol] = (scope !== undefined) ? scope : symbols_1.AsScopeSelfIdentifedSymbol;
    };
}
exports.AsScope = AsScope;
//# sourceMappingURL=scopes.js.map