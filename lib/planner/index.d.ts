import { Identifier } from "../interfaces";
import { BindingMap, BindingData } from "../binder/data";
import { DependencyGraphNode } from "./interfaces";
export * from "./interfaces";
export * from "./utils";
export declare function createPlanForBinding(identifier: Identifier, binding: BindingData, bindingsForIdentifier: BindingMap): DependencyGraphNode;
export declare function createPlanForIdentifier(root: Identifier, bindingsForIdentifier: BindingMap): DependencyGraphNode;
