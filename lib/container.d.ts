import { Identifier, Newable } from "./interfaces";
import { ContainerModule } from "./module";
import { Binder } from "./binder";
export declare class Container {
    /**
     * All bindings currently registered with this container.
     */
    private _binders;
    /**
     * Loads bindings from Inversify-style container modules.
     * @param modules The Inversify-compatible container modules to load.
     */
    load(...modules: ContainerModule[]): void;
    /**
     * Create a binder to bind a service identifier to an implementation.
     * @param id The service identifier.
     * This is a fluent api.  Use the returned Binder object to configure the object.
     */
    bind<T>(id: Identifier<T>): Binder;
    /**
     * Create a new instance of an injectable class.
     * The class must be declared injectable using the @Injectable annotation.
     * Injectable constructor arguments will be resolved.
     * @param ctor The class constructor.
     * @returns The created class.
     */
    create<T>(ctor: Newable<T>): T;
    /**
     * Gets the bound object for an identifier.  This may create the object if necessary depending on scope and previous creations.
     * If multiple objects are bound to the identifier, the object chosen may not be predictable.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get<T>(identifier: Identifier<T>): T;
    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll<T>(identifier: Identifier<T>): T[];
    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean;
}
