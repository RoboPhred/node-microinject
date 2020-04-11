import { Identifier } from "../interfaces";
import { BindingCore, ConstBinding, ConstructorBinding, FactoryBinding, ParentBinding } from "../binder/binding";
import { Scope } from "../scope";
import { DependencyGraphPlanner } from "./planner";
export declare type ScopeDefiner = ScopedDependenencyNode | symbol;
export interface ScopeInstance {
    /**
     * The ComponentCreator that defined this scope.
     *
     * May be SingletonSymbol as a special case for singleton-scoped services.
     */
    scopeDefiner: ScopeDefiner;
    /**
     * Instances of scopable component creators that are in this scope,
     * keyed by the bindingId of the binding that created the given instance.
     */
    instances: Map<string, ScopedDependenencyNode>;
}
export declare type ScopeInstanceMap = Map<Scope, ScopeInstance>;
export interface DependencyNodeBase {
    /**
     * The specific instance of this node relative to its containing scope.
     * This does not correspond to the instance of the created value,
     * as a plan may be executed several times.
     */
    nodeId: string;
}
export interface ParamDependencyNode {
    type: "param";
    optional: boolean;
    paramKey: string | symbol;
}
export interface BindingDependencyNodeBase extends DependencyNodeBase, BindingCore {
    /**
     * The service identifier this node represents.
     */
    identifier: Identifier;
}
export interface ParentDependencyNode extends BindingDependencyNodeBase, ParentBinding {
    type: "parent";
}
export interface ConstDependencyNode extends BindingDependencyNodeBase, ConstBinding {
    type: "value";
}
export interface ScopedBindingDependencyNodeBase extends BindingDependencyNodeBase {
    /**
     * The instance of the node that defines the scope this
     * node is contained in.
     */
    scopeOwnerNodeId?: string;
}
export interface FactoryDependencyNode extends ScopedBindingDependencyNodeBase, FactoryBinding {
    type: "factory";
    /**
     * The planner responsible for planning requests
     * made by this factory.
     */
    planner: DependencyGraphPlanner;
}
export interface ConstructorDependencyNode extends ScopedBindingDependencyNodeBase, ConstructorBinding {
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
     * If the value is a node, the node should be resolved and injected.
     * If the value is an array of nodes, the nodes should be resolved
     * and the array of resolved values injected.
     * If the value is `null`, then `null` should be injected.
     */
    propInjectionNodes: Map<string, InjectedValue>;
}
export declare type InjectedValue = DependencyNode | DependencyNode[] | null;
export declare type DependencyNode = ParamDependencyNode | ParentDependencyNode | ConstDependencyNode | FactoryDependencyNode | ConstructorDependencyNode;
export declare type BindingDependencyNode = ConstDependencyNode | FactoryDependencyNode | ConstructorDependencyNode;
export declare type ScopedDependenencyNode = FactoryDependencyNode | ConstructorDependencyNode;
export declare function isBindingDependencyNode(node: DependencyNode): node is BindingDependencyNode;
export declare function getDependencyNodeIdentifier(node: DependencyNode): Identifier<any>;
