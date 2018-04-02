
import {
    Identifier
} from "../interfaces";

import {
    BindingCore,
    ConstBinding,
    FactoryBinding,
    ConstructorBinding,
    BindingType
} from "../binder/binding";

import {
    InjectionOptions
} from "../injection";


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
    /**
     * An array whose indexes correspond to those of ```injection```,
     * and whose elements describe what is to be injected into the argument.
     * 
     * The elements may be a single DependencyNode, an array of
     * DependencyNode objects, or null.
     * If the value is a node, the node should be resolved and rejected.
     * If the value is an array of nodes, the nodes should be resolved
     * and the array of resolved values injected.
     * If the value is ```null``, then ```null``` should be injected.
     */
    injectionNodes: InjectedArgumentValue[];
}

export type InjectedArgumentValue = DependencyNode | DependencyNode[] | null;

export type DependencyNode =
    ConstDependencyNode
    | FactoryDependencyNode
    | ConstructorDependencyNode;

export type ScopedDependenencyNode = FactoryDependencyNode | ConstructorDependencyNode;