import { Identifier } from "../interfaces";
import { InjectionOptions } from "./interfaces";
/**
 * Marks this class as injectable.
 * Injectable classes can be created by a container.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
export declare function injectable<TFunction extends Function>(identifier?: Identifier): (target: TFunction) => void;
/**
 * Marks a constructor argument or object propertie as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export declare function inject(identifier: Identifier, opts?: InjectionOptions): (target: any, targetKey: string, index?: number | undefined) => void;
/**
 * Marks a constructor argument or object property as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
export declare function optional(): (target: any, targetKey: string, index?: number | undefined) => void;
