"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
const predefined_1 = require("./predefined");
function singleton() {
    return function (target) {
        target[symbols_1.AutoBindInScopeKey] = predefined_1.SingletonScope;
    };
}
exports.singleton = singleton;
function inScope(scope) {
    return function (target) {
        target[symbols_1.AutoBindInScopeKey] = scope;
    };
}
exports.inScope = inScope;
/**
 * Specify that this object creates a new named scope.
 * @param scope The optional scope identifier to identify the scope created by this object.  If unset, the object will be identified by the identifier of the object.
 */
function asScope(scope) {
    return function (target) {
        target[symbols_1.AutoBindAsScopeKey] =
            scope !== undefined ? scope : predefined_1.SelfIdentifiedScope;
    };
}
exports.asScope = asScope;
//# sourceMappingURL=decorators.js.map