import { Container } from "./container";

/**
 * An object that may be used to represent and request a container-managed object.
 */
export type Identifier<T = any> = string | symbol | AutoBoundIdentifier<T>;

/**
 * Identifiers capable of being automatically bound based on decorators.
 */
export type AutoBoundIdentifier<T = any> = Newable<T> | ServiceFactory<T>;

/**
 * A constructor creating a new object of type T.
 */
export interface Newable<T = any> {
  new (...args: any[]): T;
}

/**
 * A factory function capable of creating objects in the context
 * and scope of a dependency resolution.
 */
export type ServiceFactory<T = any> = (context: Context) => T;

/**
 * An object capable of resolving identifiers to objects.
 */
export interface ServiceLocator {
  create<T>(ctor: Newable<T>): T;
  get<T>(identifier: Identifier<T>): T;
  getAll<T>(identifier: Identifier<T>): T[];
  has(identifier: Identifier): boolean;
}

/**
 * The context of an object creation.
 */
export interface Context extends ServiceLocator {
  /**
   * The container at the root of this instantiation.
   * Note that this container is not aware of the current scope stack.
   * Attempting to get a scoped item will fail.
   *
   * To get scoped items, use Context.get() and Context.getAll()
   */
  readonly container: Container;
}
