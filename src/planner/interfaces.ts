
import {
    Identifier,
    Newable
} from "../interfaces";

import {
    Scope
} from "../scope";


export type ComponentCreatorType = "value" | "array" | "factory" | "constructor";
export interface ComponentCreatorBase {
    type: ComponentCreatorType;
    componentId: string;
}

export interface ValueComponentCreator extends ComponentCreatorBase {
    type: "value";
    value: any;
}

/**
 * A special case of component creator, useful for where
 * multiple matches of an identifier need to be injected.
 */
export interface ArrayComponentCreator extends ComponentCreatorBase {
    type: "array";
    values: DependencyGraphNode[];
}

export interface CanDefineScope {
    /**
     * The Scope for which this creator defines an instance of.
     */
    defineScope?: Scope;
}

export interface CanBeScoped {
    /**
     * The Scope type that this creator is contained in.
     */
    containingScope?: Scope;
    /**
     * The specific instance of the scope-defining creator acting as the scope this creator is contained in.
     * May be SingletonSymbol for the singleton scope.
     */
    containingScopeInstance?: ScopeDefiningComponentCreator;
}

export interface FactoryComponentCreator extends ComponentCreatorBase, CanBeScoped, CanDefineScope {
    type: "factory";
    factory: (...args: any[]) => any;
}

export interface ConstructorComponentCreator extends ComponentCreatorBase, CanBeScoped, CanDefineScope {
    type: "constructor";
    ctor: Newable;
    args: DependencyGraphNode[];
}

export type ComponentCreator = ValueComponentCreator | FactoryComponentCreator | ConstructorComponentCreator | ArrayComponentCreator;
export type ScopeableComponentCreator = FactoryComponentCreator | ConstructorComponentCreator;
export type ScopeDefiningComponentCreator = FactoryComponentCreator | ConstructorComponentCreator;

export type DependencyGraphNode<TCreator extends ComponentCreator = ComponentCreator> = {
    /**
     * The consumer this node is identifying.
     */
    identifier: Identifier;

    /**
     * Information on how to resolve the identifier.
     * Different identifiers may resolve to the same reference.
     * To represent this, the same componentCreator reference will be used.
     */
    componentCreator: ComponentCreator;
};