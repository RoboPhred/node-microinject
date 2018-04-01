"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isScopeableBinding(binding) {
    return binding.type === "factory" || binding.type === "constructor";
}
exports.isScopeableBinding = isScopeableBinding;
//# sourceMappingURL=binding.js.map