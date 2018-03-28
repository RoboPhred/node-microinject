"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function Singleton() {
    return function (target) {
        target[symbols_1.InScopeDecoratorSymbol] = symbols_1.SingletonScopeSymbol;
    };
}
exports.Singleton = Singleton;
function InScope(scope) {
    return function (target) {
        target[symbols_1.InScopeDecoratorSymbol] = scope;
    };
}
exports.InScope = InScope;
/**
 * Specify that this object creates a new named scope.
 * @param scope The optional scope identifier to identify the scope created by this object.  If unset, the object will be identified by the identifier of the object.
 */
function AsScope(scope) {
    return function (target) {
        target[symbols_1.AsScopeDecoratorSymbol] = (scope !== undefined) ? scope : symbols_1.SelfIdentifiedScopeSymbol;
    };
}
exports.AsScope = AsScope;
//# sourceMappingURL=decorators.js.map