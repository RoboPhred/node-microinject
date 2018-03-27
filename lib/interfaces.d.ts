import { Container } from "./container";
/**
 * An object that may be used to represent and request a container-managed object.
 */
export declare type Identifier<T = any> = string | symbol | AutoBoundIdentifier<T>;
export declare type AutoBoundIdentifier<T = any> = Newable<T> | ServiceFactory<T>;
/**
 * An object that identifies an object creation scope.
 */
export declare type Scope<T = any> = string | symbol | T | Newable<T>;
/**
 * A constructor creating a new object of type T.
 */
export interface Newable<T = any> {
    new (...args: any[]): T;
}
export interface ServiceFactory<T = any> {
    (context: Context): T;
}
/**
 * The context of an object creation.
 */
export interface Context {
    /**
     * The container that is creating the object.
     */
    readonly container: Container;
    readonly scopes: ScopeMap;
}
export interface ScopeMap extends ReadonlyMap<Scope, any> {
    get<T>(scope: Scope<T>): T;
}
