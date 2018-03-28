
import {
    Identifier,
    ServiceFactory
} from "../interfaces";

import {
    AutobindAsFactoryKey,
    AutobindIdentifiersKey
} from "./symbols";


/**
 * Marks the function as a factory function when auto-binding.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
export function factory<TFunction extends ServiceFactory<T>, T = any>(identifier?: Identifier): (target: TFunction) => void {
    return function(target: any) {
        target[AutobindAsFactoryKey] = true;
        if (identifier) {
            if (target[AutobindIdentifiersKey] == null) target[AutobindIdentifiersKey] = [];
            target[AutobindIdentifiersKey].push(identifier);
        }
    }
}

/**
 * Specify that the given constructor or function provides the given identifier.
 * This is used when auto-binding is invoked by passing the object directly as the identifier.
 * This decorator can be used more than once to mark the object as providing multiple services.
 * @param identifier The identifier to automatically bind this class to when bound without additional configuration.
 */
export function provides<TFunction extends Function>(identifier: Identifier): (target: TFunction) => void {
    return function(target: any) {
        if (target[AutobindIdentifiersKey] == null) target[AutobindIdentifiersKey] = [];
        target[AutobindIdentifiersKey].push(identifier);
    }
}
