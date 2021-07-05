import { Container } from "./container";
import { BindFunction } from "./binder";
/**
 * An object that may be used to represent and request a container-managed object.
 */
export declare type Identifier<T = any> = string | symbol | AutoBoundIdentifier<T>;
/**
 * Identifiers capable of being automatically bound based on decorators.
 */
export declare type AutoBoundIdentifier<T = any> = Newable<T>;
/**
 * A map of parameters to provide when resolving param injections.
 */
export declare type ParameterRecord = Record<string | number | symbol, any>;
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
export declare type ServiceFactory<T = any> = (context: Context) => T;
/**
 * An object capable of resolving identifiers to objects.
 */
export interface ServiceLocator {
    /**
     * Creates a new instance of the class, resolving its injections.
     * @param ctor The class constructor to instantiate.
     * @param parameters Parameters to pass to parameter injections.
     */
    create<T>(ctor: Newable<T>, parameters?: ParameterRecord): T;
    /**
     * Resolves an identifier from the container bindings.
     * @param identifier The identifier to resolve.
     * @param parameters Parameters to pass to parameter injections for any new objects created.
     *
     * Note: Parameters will not apply if the object or objects being resolved have already
     * been resolved in their scope.
     */
    get<T>(identifier: Identifier<T>, parameters?: ParameterRecord): T;
    /**
     * Get all instances bound to the identifier.
     * @param identifier The identifier to retrieve all bound instances for.
     */
    getAll<T>(identifier: Identifier<T>): T[];
    /**
     * Checks to see if the identifier is known to the container.
     * @param identifier The identifier to check.
     */
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
    /**
     * Injection parameters passed to this request.
     */
    readonly parameters: ParameterRecord;
}
/**
 * An object capable of creating bindings against a container.
 */
export interface RegistryModule {
    registry(bind: BindFunction): void;
}
