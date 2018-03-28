import { Identifier } from "./interfaces";
import { ContainerModule } from "./module";
import { Binder } from "./binder";
export declare class Container {
    private _planner;
    private _resolver;
    /**
     * Container to use if a binding is not find in this container.
     */
    private _parent;
    parent: Container | null;
    /**
     * Loads bindings from Inversify-style container modules.
     * @param modules The Inversify-compatible container modules to load.
     */
    load(...modules: ContainerModule[]): void;
    /**
     * Create a binder to bind a service identifier to an implementation.
     *
     * If the identifier is a class marked by @Injectable(), the binder will auto-bind
     * itself while still allowing you to override its behavior with the returned binder.
     *
     * If a class is passed with @Injectable(), the binding will be bound to both
     * the class and to the auto-bind identifier specified with @Injectable()
     * @param identifier The service identifier.
     * @returns A binder object to configure the binding.
     */
    bind<T>(identifier: Identifier<T>): Binder;
    private _addBinder<T>(identifier, binder);
    /**
     * Clears out knowledge of all resolved identifiers and scopes.
     * Previously resolved objects and factory bindings will still
     * continue to work normally off the old data.
     *
     * This does not clear the container's bindings.  All previously
     * configured bindings remain configured.
     */
    reset(): void;
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
    private _getAll<T>(identifier);
    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean;
}
