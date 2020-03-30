import { Identifier, Newable } from "../interfaces";
/**
 * Specify that the given constructor or function provides the given identifier.
 * This is used when auto-binding is invoked by passing the object directly as the identifier.
 * This decorator can be used more than once to mark the object as providing multiple services.
 * @param identifier The identifier to automatically bind this class to when bound without additional configuration.
 */
export declare function provides<TIdentifier, TFunction extends Newable<TIdentifier>>(identifier: Identifier<TIdentifier>): (target: TFunction) => void;
