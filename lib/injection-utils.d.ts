import { Identifier } from "./interfaces";
import { InjectionOptions } from "./injections";
/**
 * Data associated with an injection.
 */
export interface InjectionData extends InjectionOptions {
    identifier: Identifier;
}
/**
 * Returns a value indicating whether the target has been marked as injectable.
 * @param target The target to test for injectability.
 */
export declare function isInjectable(target: any): boolean;
/**
 * Returns the autobind identifier of the target, if any was specified.  Returns undefined if none was specified.
 * @param target The target to test for injectability.
 */
export declare function getIdentifier(target: any): Identifier;
/**
 * Returns data on injections to the target constructor's arguments.  If no injections are specified, an empty array is returned.
 * This does not check the target for injectability.
 * @param target The target to obtain constructor injections for.
 */
export declare function getConstructorInjections(target: any): InjectionData[];
