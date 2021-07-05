import { Identifier } from "../interfaces";
import { Scope } from "../scope";
import { IdentifierInjectionOptions, ParameterInjectionOptions } from "./interfaces";
/**
 * Data associated with an injection.
 */
export declare type InjectionData = IdentifierInjectionData | ParameterInjectionData | ScopeInjectionData;
export interface IdentifierInjectionData extends IdentifierInjectionOptions {
    type: "identifier";
    identifier: Identifier;
}
export interface ParameterInjectionData extends ParameterInjectionOptions {
    type: "parameter";
    paramKey: string | symbol;
}
export interface ScopeInjectionData {
    type: "scope";
    scope: Scope;
}
/**
 * Returns a value indicating whether the target has been marked as injectable.
 * @param target The target to test for injectability.
 */
export declare function isInjectable(target: any): boolean;
/**
 * Returns data on injections to the target constructor's arguments.  If no injections are specified, an empty array is returned.
 * This does not check the target for injectability.
 * @param target The target to obtain constructor injections for.
 */
export declare function getConstructorInjections(target: any): InjectionData[];
/**
 * Returns a map of property names to their injection data.
 * @param target The target to obtain property injections for.
 */
export declare function getPropertyInjections(target: any): Map<string, InjectionData>;
