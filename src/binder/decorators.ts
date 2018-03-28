
import {
    Identifier,
    ServiceFactory
} from "../interfaces";

import {
    IsAutoBindFactorySymbol,
    AutobindIdentifierSymbol
} from "../symbols";


/**
 * Marks the function as a factory function when auto-binding.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
export function Factory<TFunction extends ServiceFactory<T>, T = any>(identifier?: Identifier): (target: TFunction) => void {
    return function(target: any) {
        target[IsAutoBindFactorySymbol] = true;
        if (identifier) {
            if (target[AutobindIdentifierSymbol] == null) target[AutobindIdentifierSymbol] = [];
            target[AutobindIdentifierSymbol].push(identifier);
        }
    }
}

/**
 * Specify that the given constructor or function provides the given identifier.
 * This is used when auto-binding is invoked by passing the object directly as the identifier.
 * This decorator can be used more than once to mark the object as providing multiple services.
 * @param identifier The identifier to automatically bind this class to when bound without additional configuration.
 */
export function Provides<TFunction extends Function>(identifier: Identifier): (target: TFunction) => void {
    return function(target: any) {
        if (target[AutobindIdentifierSymbol] == null) target[AutobindIdentifierSymbol] = [];
        target[AutobindIdentifierSymbol].push(identifier);
    }
}
