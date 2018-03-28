"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
function getSymbol(name) {
    return symbols_1.getSymbol(`/scope/${name}`);
}
exports.getSymbol = getSymbol;
/**
 * The key used to store the .inScope() binding configuration on an auto-bound object.
 */
exports.InScopeDecoratorSymbol = getSymbol("InScope");
/**
 * The key used to store the .asScope() binding configuration on an auto-bound object.
 */
exports.AsScopeDecoratorSymbol = getSymbol("AsScope");
/**
 * A placeholder scope value to indicate that the binding should establish the scope
 * identified by the primary identifier of the binding.
 */
exports.SelfIdentifiedScopeSymbol = getSymbol("AsScopeSelfIdentified");
/**
 * A special scope indicating that the value is a singleton.
 * There is always a single instance of the singleton scope,
 * owned by the top level resolver.
 */
exports.SingletonScopeSymbol = getSymbol("SingletonScope");
//# sourceMappingURL=symbols.js.map