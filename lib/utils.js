"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.has = exports.scopeToString = exports.identifierToString = void 0;
/**
 * Returns a string representation of the identifier.
 * @param identifier The identifier to stringify.
 */
function identifierToString(identifier) {
    if (typeof identifier === "symbol") {
        return String(identifier);
    }
    if (typeof identifier === "function" && identifier.constructor) {
        return identifier.constructor.name;
    }
    return String(identifier);
}
exports.identifierToString = identifierToString;
/**
 * Returns a string representation of the scope.
 * @param scope The scope to stringify.
 */
function scopeToString(scope) {
    return String(scope);
}
exports.scopeToString = scopeToString;
function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
exports.has = has;
//# sourceMappingURL=utils.js.map