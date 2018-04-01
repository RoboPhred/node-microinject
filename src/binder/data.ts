
import {
    Identifier,
    Newable,
    Context
} from "../interfaces";

import {
    Scope   
 } from "../scope";

import {
    InjectionData
} from "../injection/utils";

export type BindingType = "value" | "factory" | "constructor";

export interface BindingCore {
    type: BindingType;
}

export interface ConstBinding extends BindingCore {
    type: "value";
    value: any;
}

export interface InstanceCreatorBinding extends BindingCore {
    definesScope?: Scope;
    createInScope?: Scope;
}

export interface FactoryBinding extends InstanceCreatorBinding {
    type: "factory";
    factory: (context: Context) => any;
}

export interface ConstructorBindingData extends InstanceCreatorBinding {
    type: "constructor";
    ctor: Newable;
    injections: InjectionData[];
}

export type Binding = ConstBinding | FactoryBinding | ConstructorBindingData;
export type ScopeableBinding = FactoryBinding | ConstructorBindingData;

export type BindingMap = ReadonlyMap<Identifier, Binding[]>;

export function isScopeableBinding(binding: Binding): binding is ScopeableBinding {
    return binding.type === "factory" || binding.type === "constructor";
}
