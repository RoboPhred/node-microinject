import { Identifier } from "../interfaces";

import {
  BindingCore,
  BindingType,
  ConstBinding,
  ConstructorBinding,
  FactoryBinding
} from "../binder/binding";

import { Scope } from "../scope";
import { DependencyGraphPlanner } from "./planner";

export type ScopeDefiner = ScopedDependenencyNode | symbol;

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
export type ScopeInstanceMap = Map<Scope, ScopeInstance>;

export interface DependencyNodeBase extends BindingCore {
  /**
   * The service identifier this node represents.
   */
  identifier: Identifier;

  /**
   * The specific instance of this node relative to its containing scope.
   * This does not correspond to the instance of the created value,
   * as a plan may be executed several times.
   */
  nodeId: string;
}

export interface ConstDependencyNode extends DependencyNodeBase, ConstBinding {
  type: "value";
}

export interface ScopedDependencyNodeBase extends DependencyNodeBase {
  /**
   * The instance of the node that defines the scope this
   * node is contained in.
   */
  scopeOwnerNodeId?: string;
}

export interface FactoryDependencyNode
  extends ScopedDependencyNodeBase,
    FactoryBinding {
  type: "factory";

  /**
   * The planner responsible for planning requests
   * made by this factory.
   */
  planner: DependencyGraphPlanner;
}

export interface ConstructorDependencyNode
  extends ScopedDependencyNodeBase,
    ConstructorBinding {
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

export type InjectedValue = DependencyNode | DependencyNode[] | null;

export type DependencyNode =
  | ConstDependencyNode
  | FactoryDependencyNode
  | ConstructorDependencyNode;

export type ScopedDependenencyNode =
  | FactoryDependencyNode
  | ConstructorDependencyNode;
