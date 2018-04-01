import { Identifier } from "../interfaces";
import { ConstDependencyNode, FactoryDependencyNode, ConstructorDependencyNode } from "../planner";
import { DependencyGraphResolver } from "./interfaces";
export interface ComponentResolvers {
    const: (identifier: Identifier, creator: ConstDependencyNode, childResolver: DependencyGraphResolver) => any;
    factory: (identifier: Identifier, creator: FactoryDependencyNode, childResolver: DependencyGraphResolver) => any;
    ctor: (identifier: Identifier, creator: ConstructorDependencyNode, childResolver: DependencyGraphResolver) => any;
}
export declare const defaultComponentResolvers: ComponentResolvers;
