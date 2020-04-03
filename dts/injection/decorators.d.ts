import { Identifier } from "../interfaces";
import { IdentifierInjectionOptions, ParameterInjectionOptions } from "./interfaces";
/**
 * Marks this class as injectable.
 * Injectable classes can be injected by a container into injectables.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for `@injectable() @provides(identifier)`.
 */
export declare function injectable<TFunction extends Function>(identifier?: Identifier): (target: TFunction) => void;
/**
 * Marks a constructor argument or object propertie as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export declare function inject(identifier: Identifier, opts?: IdentifierInjectionOptions): (target: any, targetKey: string | symbol, index?: number | undefined) => void;
/**
 * Marks a constructor argument as receiving a param when created from `ServiceLocator.create()`.
 * @param paramName The identifier of the parameter to use.
 */
export declare function param(paramKey: string | number | symbol, opts?: ParameterInjectionOptions): (target: any, targetKey: string | symbol, index?: number | undefined) => void;
