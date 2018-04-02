import { Identifier, Newable, Context } from "../interfaces";
import { Scope } from "../scope";
import { InjectionData } from "../injection/utils";
export declare type BindingType = "value" | "factory" | "constructor";
export interface BindingCore {
    type: BindingType;
    bindingId: string;
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
export interface ConstructorBinding extends InstanceCreatorBinding {
    type: "constructor";
    ctor: Newable;
    injections: InjectionData[];
}
export declare type Binding = ConstBinding | FactoryBinding | ConstructorBinding;
export declare type ScopeableBinding = FactoryBinding | ConstructorBinding;
export declare type BindingMap = ReadonlyMap<Identifier, Binding[]>;
export declare function isScopeableBinding(binding: Binding): binding is ScopeableBinding;
