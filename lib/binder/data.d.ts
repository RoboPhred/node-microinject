import { Identifier, Newable, Context } from "../interfaces";
import { Scope } from "../scope";
import { InjectionData } from "../injection-utils";
export declare type BindingDataType = "value" | "factory" | "constructor";
export interface BindingDataBase {
    type: BindingDataType;
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
export declare type BindingData = ConstBindingData | FactoryBindingData | ConstructorBindingData;
export declare type ScopeableBindingData = FactoryBindingData | ConstructorBindingData;
export declare type BindingMap = ReadonlyMap<Identifier, BindingData[]>;
export declare function isScopeableBinding(binding: BindingData): binding is ScopeableBindingData;
