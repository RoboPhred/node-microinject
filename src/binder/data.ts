
import {
    Identifier,
    Scope,
    Newable,
    Context
} from "../interfaces";

import {
    InjectionData
} from "../injection-utils";

export interface BindingDataBase {
    type: "value" | "factory" | "constructor";
}

export interface ConstBindingData extends BindingDataBase {
    type: "value";
    value: any;
}

export interface InstanceCreatorBindingData extends BindingDataBase {
    defineScope?: Scope;
    inScope?: Scope;
}

export interface FactoryBindingData extends InstanceCreatorBindingData {
    type: "factory";
    factory: (context: Context) => any;
}

export interface ConstructorBindingData extends InstanceCreatorBindingData {
    type: "constructor";
    ctor: Newable;
    injections: InjectionData[];
}

export type BindingData = ConstBindingData | FactoryBindingData | ConstructorBindingData;

export type BindingMap = ReadonlyMap<Identifier, BindingData[]>;