
import {
    Identifier,
    Newable,
    Context,
    ScopeMap,
    Scope
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
    getConstructorInjections
} from "./injection-utils";

import {
    getProvidedIdentifiers
} from "./binding-utils";

import {
    isSingleton
} from "./scope-utils";

import {
    IdentifierNotBoundError
} from "./errors";

import {
    BinderImpl
} from "./binder-impl";

import {
    identifierToString
} from "./utils";


export class Container {
    /**
     * All bindings currently registered with this container.
     */
    private _binders = new Map<Identifier, BinderImpl<any>[]>();

    /**
     * Container to use if a binding is not find in this container.
     */
    private _parent: Container | null = null;

    get parent(): Container | null {
        return this._parent;
    }

    set parent(value: Container | null) {
        this._parent = value;
    }

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
        const autoIdentifiers = getProvidedIdentifiers(identifier);
        for (let identifier of autoIdentifiers) {
            this._addBinder(identifier, binder);
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
    create<T>(ctor: Newable<T>, scopes?: ScopeMap): T {
        if (!isInjectable(ctor)) {
            throw new Error(`The constructor "${ctor.name}" is not injectable.`);
        }

        // If no scopes specified, create a scope map to avoid repeated
        //  map creation during dependency resolution loop.
        if (!scopes) {
            scopes = new Map<Scope, any>();
        }

        const dependencies = getConstructorInjections(ctor);
        const resolved = dependencies.map((injectData, i) => {
            if (injectData.identifier == null) {
                throw new Error(`Constructor "${ctor.name}" parameter ${i} has injection annotation but no service identifier.`);
            }

            const has = this.has(injectData.identifier);
            if (!has) {
                if (injectData.optional) return injectData.all ? [] : null;
                throw new IdentifierNotBoundError(`Constructor "${ctor.name}" parameter ${i} requests identifier "${identifierToString(injectData.identifier)}" which is not bound.`);
            }

            if (injectData.all) {
                return this.getAll(injectData.identifier, scopes);
            }
            else {
                return this.get(injectData.identifier, scopes);
            }
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
    get<T, S = any>(identifier: Identifier<T>, scopes?: ScopeMap): T {
        const binders = this._binders.get(identifier);
        if (binders == null) {
            if (this._parent) return this._parent.get<T, S>(identifier, scopes);
            throw new IdentifierNotBoundError(`No binding exists for identifier "${identifierToString(identifier)}".`);
        }

        if (!scopes) scopes = new Map<Scope, any>();
        return binders[0]._getBinding()._getBoundValue({ container: this, scopes });
    }

    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll<T, S = any>(identifier: Identifier<T>, scopes?: ScopeMap): T[] {
        const binders = this._binders.get(identifier);
        if (binders == null) {
            if (this._parent) return this._parent.getAll<T, S>(identifier, scopes);
            throw new IdentifierNotBoundError(`No binding exists for identifier "${identifierToString(identifier)}".`);
        }

        if (!scopes) scopes = new Map<Scope, any>();
        const context: Context = { container: this, scopes };
        const localValues = binders.map(x => x._getBinding()._getBoundValue(context));
        const parentValues: any[] = this._parent ? this._parent.getAll<T, S>(identifier, scopes) : [];
        return localValues.concat(parentValues);
    }

    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean {
        return this._binders.has(identifier) || Boolean(this._parent && this._parent.has(identifier));
    }
}
