"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyInjections = exports.getConstructorInjections = exports.isInjectable = void 0;
const symbols_1 = require("./symbols");
/**
 * Returns a value indicating whether the target has been marked as injectable.
 * @param target The target to test for injectability.
 */
function isInjectable(target) {
    return target[symbols_1.ClassIsInjectableKey] === true;
}
exports.isInjectable = isInjectable;
/**
 * Returns data on injections to the target constructor's arguments.  If no injections are specified, an empty array is returned.
 * This does not check the target for injectability.
 * @param target The target to obtain constructor injections for.
 */
function getConstructorInjections(target) {
    return target[symbols_1.ConstructorInjectionsKey] || [];
}
exports.getConstructorInjections = getConstructorInjections;
/**
 * Returns a map of property names to their injection data.
 * @param target The target to obtain property injections for.
 */
function getPropertyInjections(target) {
    const prototype = target.prototype;
    if (!prototype)
        return new Map();
    return prototype[symbols_1.PropertyInjectionsKey] || new Map();
}
exports.getPropertyInjections = getPropertyInjections;
//# sourceMappingURL=utils.js.map