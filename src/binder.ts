
import {
    Newable,
    Context
} from "./interfaces";

/**
 * An interface providing a fluent api to bind a ServiceIdentifier to an implementation.
 */
export interface Binder {

    /**
     * Binds the service identifier to a class constructor.
     * @param construct The constructor of the object to create.
     * The container will try to inject dependencies for the constructor's parameters. 
     */
    to<T>(construct: Newable<T>): ScopedBinder;

    /**
     * Binds the service identifier to a value factory function.
     * @param factory The factory function to provide the value.
     */
    toDynamicValue<T>(factory: (context: Context) => T): ScopedBinder;

    /**
     * Binds the service identifier to the constant value.
     * @param obj The constant value to return.
     */
    toConstantValue<T>(obj: T): void;
}

/**
 * Additional binder behaviors for scoped bindings.
 */
export interface ScopedBinder {
    /**
     * Mark the binding as a singleton.  Only one will be created per container.
     */
    inSingletonScope(): void;

    /**
     * Mark the binding as transient.  A new object will be created for every request.
     * This overrides any @Singleton() annotation if used on an autobind class.
     */
    inTransientScope(): void;
}