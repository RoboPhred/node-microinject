"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isBindingDependencyNode(node) {
    return (node.type === "value" ||
        node.type === "factory" ||
        node.type === "constructor");
}
exports.isBindingDependencyNode = isBindingDependencyNode;
function getDependencyNodeIdentifier(node) {
    if (isBindingDependencyNode(node)) {
        return node.identifier;
    }
    return node.paramKey;
}
exports.getDependencyNodeIdentifier = getDependencyNodeIdentifier;
//# sourceMappingURL=interfaces.js.map