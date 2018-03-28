"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function isAutoBindFactory(target) {
    return target[symbols_1.AutobindAsFactoryKey] || false;
}
exports.isAutoBindFactory = isAutoBindFactory;
/**
 * Returns the autobind identifiers of the target.  Returns an empty array if none were specified.
 * @param target The target to test for injectability.
 */
function getProvidedIdentifiers(target) {
    return target[symbols_1.AutobindIdentifiersKey] || [];
}
exports.getProvidedIdentifiers = getProvidedIdentifiers;
//# sourceMappingURL=utils.js.map