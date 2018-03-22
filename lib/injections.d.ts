import { Identifier } from "./interfaces";
/**
 * Options for content injections.
 */
export interface InjectionOptions {
    optional?: boolean;
}
/**
 * Marks this class as injectable.
 * @param autobindIdentifier The identifier this class will use when auto-bound (ie: the object is passed as the identifier to container.bind()).
 */
export declare function Injectable<TFunction extends Function>(autobindIdentifier?: Identifier): (target: TFunction) => void;
/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export declare function Inject(identifier: Identifier, opts?: InjectionOptions): (target: any, targetKey: string, index: number) => void;
/**
 * Marks an injectable constructor argument as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This annotation is not order sensitive.  It can come before or after @Inject().
 */
export declare function Optional(): (target: any, targetKey: string, index: number) => void;
