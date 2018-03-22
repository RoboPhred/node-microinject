"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
/**
 * Returns a value indicating whether the target has been marked as injectable.
 * @param target The target to test for injectability.
 */
function isInjectable(target) {
    return target[symbols_1.InjectableSymbol] === true;
}
exports.isInjectable = isInjectable;
/**
 * Returns the autobind identifier of the target, if any was specified.  Returns undefined if none was specified.
 * @param target The target to test for injectability.
 */
function getIdentifier(target) {
    return target[symbols_1.AutobindIdentifierSymbol];
}
exports.getIdentifier = getIdentifier;
/**
 * Returns data on injections to the target constructor's arguments.  If no injections are specified, an empty array is returned.
 * This does not check the target for injectability.
 * @param target The target to obtain constructor injections for.
 */
function getConstructorInjections(target) {
    return (target[symbols_1.ConstructorInjectionsSymbol] || []);
}
exports.getConstructorInjections = getConstructorInjections;
