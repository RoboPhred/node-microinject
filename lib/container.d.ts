import { Identifier, Newable, ScopeMap } from "./interfaces";
import { ContainerModule } from "./module";
import { Binder } from "./binder";
export declare class Container {
    /**
     * All bindings currently registered with this container.
     */
    private _binders;
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
     * Create a new instance of an injectable class.
     * The class must be declared injectable using the @Injectable decorator.
     * Injectable constructor arguments will be resolved.
     * @param ctor The class constructor.
     * @returns The created class.
     */
    create<T>(ctor: Newable<T>, scopes?: ScopeMap): T;
    /**
     * Gets the bound object for an identifier.  This may create the object if necessary depending on scope and previous creations.
     * If multiple objects are bound to the identifier, the object chosen may not be predictable.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get<T, S = any>(identifier: Identifier<T>, scopes?: ScopeMap): T;
    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll<T, S = any>(identifier: Identifier<T>, scopes?: ScopeMap): T[];
    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean;
}
