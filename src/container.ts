
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
    BinderImpl
} from "./binder/binder-impl";

import {
    BindingData
} from "./binder/data";

import {
    getProvidedIdentifiers
} from "./binder/utils";

import {
    isInjectable,
    getConstructorInjections
} from "./injection-utils";

import DependencyGraphPlanner, {
    DependencyGraphNode
} from "./planner";

import DependencyGraphResolver from "./resolver";

import {
    DependencyResolutionError
} from "./errors";

import {
    identifierToString
} from "./utils";



export class Container {
    private _planner = new DependencyGraphPlanner();
    private _resolver = new DependencyGraphResolver();

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
        this._planner.addBinding(identifier, binder)
    }

    /**
     * Clears out knowledge of all resolved identifiers and scopes.
     * Previously resolved objects and factory bindings will still
     * continue to work normally off the old data.
     * 
     * This does not clear the container's bindings.  All previously
     * configured bindings remain configured.
     */
    reset() {
        // Clearing the entire scope stack is as simple as getting
        //  a new graph resolver.
        this._resolver = new DependencyGraphResolver();

        // No need to clear the cached plans.  Bindings are kept,
        //  so the plans are still valid.
    }

    /**
     * Gets the bound object for an identifier.  This may create the object if necessary depending on scope and previous creations.
     * If multiple objects are bound to the identifier, the object chosen may not be predictable.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get<T>(identifier: Identifier<T>): T {
        if (this._planner.hasBinding(identifier)) {
            const plan = this._planner.getPlan(identifier);
            return this._resolver.resolveInstance(plan);
        }

        if (this._parent) {
            return this._parent.get(identifier);
        }

        throw new DependencyResolutionError(identifier, [], `No bindings exists for the identifier.`);
    }

    /**
     * Gets all bound objects for an identifier.  This may create the objects if necessary depending on scope and previous creations.
     * This method will throw IdentifierNotBoundError if no bindings exist for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns An array of all objects for the given identifier.
     */
    getAll<T>(identifier: Identifier<T>): T[] {
        const values = this._getAll(identifier);
        if (values.length === 0) {
            throw new DependencyResolutionError(identifier, [], `No bindings exists for the identifier.`);
        }
        return values;
    }

    private _getAll<T>(identifier: Identifier<T>): T[] {
        const values: T[] = this._parent ? this._parent._getAll(identifier) : [];

        const bindings = this._planner.getBindings(identifier);
        if (bindings.length > 0) {
            const plans = bindings.map(binding => this._planner.getPlan(identifier, binding));
            values.push(...plans.map(plan => this._resolver.resolveInstance(plan)));
        }

        return values;
    }

    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean {
        return this._planner.hasBinding(identifier) || Boolean(this._parent && this._parent.has(identifier));
    }
}
