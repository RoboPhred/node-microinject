import { Container } from "./container";
/**
 * An object that may be used to represent and request a container-managed object.
 */
export declare type Identifier<T = any> = string | symbol | T | Newable<T>;
/**
 * A constructor creating a new object of type T.
 */
export interface Newable<T> {
    new (...args: any[]): T;
}
/**
 * The context of an object creation.
 */
export interface Context {
    /**
     * The container that is creating the object.
     */
    container: Container;
}
