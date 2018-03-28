"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
function getSymbol(id) {
    return symbols_1.getSymbol(`/injection/${id}`);
}
/**
 * Symbol used as a key to mark a class as being dependency-injectable.
 */
exports.ClassIsInjectableKey = getSymbol("InjectableDecorator");
/**
 * Symbol used as a key to contain the array of InjectionData objects
 * corresponding to the class's constructor arguments.
 */
exports.ConstructorInjectionsKey = getSymbol("ConstructorInjectionDecorators");
//# sourceMappingURL=symbols.js.map