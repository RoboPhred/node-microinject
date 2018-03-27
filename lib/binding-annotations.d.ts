import { Identifier, ServiceFactory } from "./interfaces";
/**
 * Marks the function as a factory function when auto-binding.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
export declare function Factory<TFunction extends ServiceFactory<T>, T = any>(identifier?: Identifier): (target: TFunction) => void;
/**
 * Specify that the given constructor or function provides the given identifier.
 * This is used when auto-binding is invoked by passing the object directly as the identifier.
 * This annotation can be used more than once to mark the object as providing multiple services.
 * @param identifier The identifier to automatically bind this class to when bound without additional configuration.
 */
export declare function Provides<TFunction extends Function>(identifier: Identifier): (target: TFunction) => void;
