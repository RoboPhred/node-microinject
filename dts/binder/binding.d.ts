import { Context, Identifier, Newable } from "../interfaces";
import { Scope } from "../scope";
import { InjectionData } from "../injection/utils";
export declare type BindingType = "value" | "factory" | "constructor" | "parent";
export interface BindingCore {
    /**
     * The type of the binding.
     */
    type: BindingType;
    /**
     * The ID of the binding.
     */
    bindingId: string;
    /**
     * An array of identifiers that this binding supplies.
     */
    identifiers: Identifier[];
}
export interface ConstBinding extends BindingCore {
    type: "value";
    value: any;
}
export interface InstanceCreatorBinding extends BindingCore {
    definesScope?: Scope;
    createInScope?: Scope;
}
export interface BindingFactoryFunction {
    (context: Context): any;
}
export interface FactoryBinding extends InstanceCreatorBinding {
    type: "factory";
    factory: BindingFactoryFunction;
}
export interface ConstructorBinding extends InstanceCreatorBinding {
    type: "constructor";
    ctor: Newable;
    ctorInjections: InjectionData[];
    propInjections: Map<string, InjectionData>;
}
export interface ParentBinding extends BindingCore {
    type: "parent";
}
export declare type Binding = ConstBinding | FactoryBinding | ConstructorBinding | ParentBinding;
export declare type ScopeableBinding = FactoryBinding | ConstructorBinding;
export declare type BindingMap = ReadonlyMap<Identifier, Binding[]>;
/**
 * Determines if a binding is capable of being in a scope.
 * For an instance to be scopeable, it must be capable of returning
 * different values per instantiation.
 * Currently, this means the binding must be a factory or constructor.
 * @param binding The binding to check for scopeability.
 */
export declare function isScopeableBinding(binding: Binding): binding is ScopeableBinding;
