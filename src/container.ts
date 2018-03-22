
import {
    Identifier,
    Newable,
    Context
} from "./interfaces";

import {
    ContainerModule
} from "./module";

import {
    Binder,
    ScopedBinder
} from "./binder";

import {
    isInjectable,
    getConstructorInjections,
    getIdentifier
} from "./injection-utils";

import {
    isSingleton
} from "./scope-utils";

import {
    IdentifierNotBoundError
} from "./errors";

import {
    BinderImpl
} from "./binder-impl";


export class Container {
    /**
     * All bindings currently registered with this container.
     */
    private _binders = new Map<Identifier, BinderImpl<any>[]>();

    /**
     * Loads bindings from Inversify-style container modules.
     * @param modules The Inversify-compatible container modules to load.
     */
    load(...modules: ContainerModule[]) {
        const bind = this.bind.bind(this);
        modules.forEach(x => x.registry(bind));
    }

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
    bind<T>(identifier: Identifier<T>): Binder {
        const binder = new BinderImpl<T>(identifier);
        this._addBinder(identifier, binder);

        // Check to see if this is an auto-bind injectable.
        const autoIdentifier = getIdentifier(identifier);
        if (autoIdentifier) {
            this._addBinder(autoIdentifier, binder);
        }

        return binder;
    }

    private _addBinder<T>(identifier: Identifier<T>, binder: BinderImpl<T>) {
        let binders: BinderImpl<T>[] | undefined = this._binders.get(identifier);
        if (binders == null) {
            binders = [];
            this._binders.set(identifier, binders);
        }
        binders.push(binder);
    }

    /**
     * Create a new instance of an injectable class.
     * The class must be declared injectable using the @Injectable annotation.
     * Injectable constructor arguments will be resolved.
     * @param ctor The class constructor.
     * @returns The created class.
     */
    create<T>(ctor: Newable<T>): T {
        if (!isInjectable(ctor)) {
            throw new Error(`The constructor "${ctor.name}" is not injectable.`);
        }

        const dependencies = getConstructorInjections(ctor);
        const resolved = dependencies.map((x, i) => {
            if (x.identifier == null) {
                throw new Error(`Constructor "${ctor.name}" parameter ${i} has injection annotation but no service identifier.`);
            }

            const has = this.has(x.identifier);
            if (!has) {
                if (x.optional) return null;
                throw new IdentifierNotBoundError(`Constructor "${ctor.name}" parameter ${i} requests identifier "${x.identifier}" which is not bound.`);
            }

            return this.get(x.identifier);
        });

        return new ctor(...resolved);
    }

    /**
     * Gets the bound object for an identifier.  This may create the object if necessary depending on scope and previous creations.
     * If multiple objects are bound to the identifier, the object chosen may not be predictable.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get<T>(identifier: Identifier<T>): T {
        const binders = this._binders.get(identifier);
        if (binders == null) {
            throw new IdentifierNotBoundError(`No binding exists for id "${identifier}".`);
        }

        return binders[0]._getBinding()._getBoundValue({ container: this });
    }

    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll<T>(identifier: Identifier<T>): T[] {
        const binders = this._binders.get(identifier);
        if (binders == null) {
            throw new IdentifierNotBoundError(`No binding exists for id "${identifier}".`);
        }

        return binders.map(x => x._getBinding()._getBoundValue({ container: this }));
    }

    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean {
        return this._binders.has(identifier);
    }
}
