
import {
    Identifier
} from "../interfaces";

import {
    InjectionOptions
} from "./interfaces";

import {
    ClassIsInjectableKey,
    ConstructorInjectionsKey,
    PropertyInjectionsKey
} from "./symbols";

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
export function isInjectable(target: any): boolean {
    return target[ClassIsInjectableKey] === true;
}

/**
 * Returns data on injections to the target constructor's arguments.  If no injections are specified, an empty array is returned.
 * This does not check the target for injectability.
 * @param target The target to obtain constructor injections for.
 */
export function getConstructorInjections(target: any): InjectionData[] {
    return (target[ConstructorInjectionsKey] || []);
}

/**
 * Returns a map of property names to their injection data.
 * @param target The target to obtain property injections for.
 */
export function getPropertyInjections(target: any): Map<string, InjectionData> {
    return (target[PropertyInjectionsKey] || new Map());
}