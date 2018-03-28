import { Identifier } from "./interfaces";
/**
 * Options for content injections.
 */
export interface InjectionOptions {
    /**
     * If true, the injected value will be null if no viable object is found in the container
     * If false, an error will be thrown at class creation time.
     */
    optional?: boolean;
    /**
     * Whether to set the variable to an array of all objects matching the identifier.
     * If true, the value will be an array of all matching objects.
     * If false, the first identified object will be used.
     *
     * Note that 'optional' is still required to avoid throwing an error if no objects are found.
     * If both 'optional' and 'all' are true, then an empty array will be set if no objects are found.
     */
    all?: boolean;
}
/**
 * Marks this class as injectable.
 * Injectable classes can be created by a container.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
export declare function Injectable<TFunction extends Function>(identifier?: Identifier): (target: TFunction) => void;
/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export declare function Inject(identifier: Identifier, opts?: InjectionOptions): (target: any, targetKey: string, index: number) => void;
/**
 * Marks an injectable constructor argument as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
export declare function Optional(): (target: any, targetKey: string, index: number) => void;