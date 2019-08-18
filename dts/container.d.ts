import { Identifier, Newable } from "./interfaces";
import { ContainerModule } from "./module";
import { Binder } from "./binder";
export declare class Container {
    private _planner;
    private _resolver;
    private _pendingBinders;
    private _bindingMap;
    /**
     * Container to use if a binding is not find in this container.
     */
    private _parent;
    constructor();
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
    bind<T>(identifier: Identifier<T>): Binder<T>;
    hasBinding(identifier: Identifier): boolean;
    /**
     * Clears out knowledge of all resolved identifiers and scopes.
     * Previously resolved objects and factories will still
     * continue to work off the old data.
     *
     * This does not clear the container's bindings.  All previously
     * configured bindings remain configured.
     */
    reset(): void;
    create<T>(ctor: Newable<T>): T;
    private _create;
    /**
     * Gets or creates the value represented by the identifier.
     * This method will throw DependencyResolutionError if there is not exactly one binding for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get<T>(identifier: Identifier<T>): T;
    private _get;
    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll<T>(identifier: Identifier<T>): T[];
    private _getAll;
    /**
     * Gets an array of values bound to the identifier.
     * If none are found, an empty array is returned.
     *
     * This is used to resolve all values across all ancestors without
     * the requirement to throw interrupting the search on an empty ancestor.
     *
     * @param identifier The identifier to get services for.
     * @param resolver The resolver to use to resolve instances of the identifier.
     */
    private _getAllNoThrow;
    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean;
    private _resolveBindings;
    private _finalizeBinders;
    /**
     * Resolver for factory bindings.
     *
     * We need to pass an argument to the function to allow it to resolve child objects,
     * and we need to pass it the root container as part of the InversifyJS api.
     *
     * @param identifier The identifier that was resolved to the factory we are resolving.
     * @param creator The factory component creator to be used to resolve the value.
     * @param childResolver A resolver capable of resolving correctly scoped child objects.
     */
    private _factoryResolver;
}
