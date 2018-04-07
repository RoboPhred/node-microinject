import { Identifier } from "../interfaces";
import { BindingCore, BindingType, ConstBinding, ConstructorBinding, FactoryBinding } from "../binder/binding";
export interface DependencyNodeBase extends BindingCore {
    /**
     * The type of the dependency node.
     */
    type: BindingType;
    /**
     * The service identifier this node represents.
     */
    identifier: Identifier;
    /**
     * The specific instance this node represents.
     */
    instanceId: string;
}
export interface ConstDependencyNode extends DependencyNodeBase, ConstBinding {
    type: "value";
}
export interface ScopedDependencyNodeBase extends DependencyNodeBase {
    /**
     * The instance of the node that defines the scope this
     * node is contained in.
     */
    scopeOwnerInstanceId?: string;
}
export interface FactoryDependencyNode extends ScopedDependencyNodeBase, FactoryBinding {
    type: "factory";
}
export interface ConstructorDependencyNode extends ScopedDependencyNodeBase, ConstructorBinding {
    type: "constructor";
    /**
     * An array whose indexes correspond to resolved injected constructor arguments.
     *
     * The elements may be a single DependencyNode, an array of
     * DependencyNode objects, or null.
     * If the value is a node, the node should be resolved and rejected.
     * If the value is an array of nodes, the nodes should be resolved
     * and the array of resolved values injected.
     * If the value is ```null``, then ```null``` should be injected.
     */
    ctorInjectionNodes: InjectedValue[];
    /**
     * A map of property names to resolved injected properties,
     * and whose elements describe what is to be injected into the argument.
     *
     * The elements may be a single DependencyNode, an array of
     * DependencyNode objects, or null.
     * If the value is a node, the node should be resolved and rejected.
     * If the value is an array of nodes, the nodes should be resolved
     * and the array of resolved values injected.
     * If the value is ```null``, then ```null``` should be injected.
     */
    propInjectionNodes: Map<string, InjectedValue>;
}
export declare type InjectedValue = DependencyNode | DependencyNode[] | null;
export declare type DependencyNode = ConstDependencyNode | FactoryDependencyNode | ConstructorDependencyNode;
export declare type ScopedDependenencyNode = FactoryDependencyNode | ConstructorDependencyNode;
