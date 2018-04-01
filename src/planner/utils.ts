
import {
    DependencyNode,
    ScopedDependenencyNode
} from "./interfaces";

export function isScopedDependencyNode(node: DependencyNode): node is ScopedDependenencyNode {
    return (node.type === "factory" || node.type === "constructor");
}