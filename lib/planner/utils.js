"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isScopedDependencyNode(node) {
    return (node.type === "factory" || node.type === "constructor");
}
exports.isScopedDependencyNode = isScopedDependencyNode;
//# sourceMappingURL=utils.js.map