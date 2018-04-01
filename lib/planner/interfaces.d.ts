import { Identifier } from "../interfaces";
import { BindingCore, ConstBinding, FactoryBinding, ConstructorBinding, BindingType } from "../binder/data";
import { InjectionOptions } from "../injection";
export interface DependencyNodeBase extends BindingCore {
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
    injectionNodes: DependencyInjection[];
}
export interface DependencyInjection extends InjectionOptions {
    identifier: Identifier;
    nodes: DependencyNode[];
}
export declare type DependencyNode = ConstDependencyNode | FactoryDependencyNode | ConstructorDependencyNode;
export declare type ScopedDependenencyNode = FactoryDependencyNode | ConstructorDependencyNode;
