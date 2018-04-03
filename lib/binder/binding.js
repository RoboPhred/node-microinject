"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Determines if a binding is capable of being in a scope.
 * For an instance to be scopeable, it must be capable of returning
 * different values per instantiation.
 * Currently, this means the binding must be a factory or constructor.
 * @param binding The binding to check for scopeability.
 */
function isScopeableBinding(binding) {
    return binding.type === "factory" || binding.type === "constructor";
}
exports.isScopeableBinding = isScopeableBinding;
//# sourceMappingURL=binding.js.map