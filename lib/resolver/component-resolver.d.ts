import { Identifier } from "../interfaces";
import { FactoryComponentCreator, ConstructorComponentCreator, ValueComponentCreator } from "../planner";
import { DependencyGraphResolver } from "./interfaces";
export interface ComponentResolvers {
    factory: (identifier: Identifier, creator: FactoryComponentCreator, childResolver: DependencyGraphResolver) => any;
    ctor: (identifier: Identifier, creator: ConstructorComponentCreator, childResolver: DependencyGraphResolver) => any;
    value: (identifier: Identifier, creator: ValueComponentCreator, childResolver: DependencyGraphResolver) => any;
}
export declare const defaultComponentResolvers: ComponentResolvers;
