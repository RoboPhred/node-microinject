
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

import {
    DependencyGraphNode,
    createPlanForIdentifier,
    createPlanForBinding
} from "./planner";

import DependencyGraphResolver from "./resolver";

import {
    DependencyResolutionError
} from "./errors";

import {
    identifierToString
} from "./utils";



export class Container {
    /**
     * All bindings currently registered with this container.
     */
    private _binders = new Map<Identifier, BinderImpl<any>[]>();

    private _planCache = new Map<Identifier, DependencyGraphNode>();

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

        this._planCache.clear();
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

        // Even thought we know what identifiers we are modifying,
        //  we may have some new identifiers which will be
        //  counted in an @Inject({all: true})
        // We could try to scan for these, but we should not be
        //  binding too much after we start to create things. 
        this._planCache.clear();

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
        const binders = this._binders.get(identifier);
        if (!binders || binders.length === 0) {
            if (this._parent) return this._parent.get(identifier);
            throw new DependencyResolutionError(identifier, [], `No binding exists for the identifier.`);
        }

        const plan = this._getPlan(identifier);
        return this._resolver.resolveInstance(plan);
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
        const binders = this._binders.get(identifier);
        if (binders == null) {
            if (this._parent) return this._parent.getAll<T>(identifier);
            return [];
        }

        const bindData = new Map<Identifier, BindingData[]>();
        for(let entry of this._binders) {
            bindData.set(entry[0], entry[1].map(x => x._getBinding()));
        }

        const plans = binders.map(x => createPlanForBinding(identifier, x._getBinding(), bindData));

        // TODO: Scopes start fresh each plan.
        const values = plans.map(x => this._resolver.resolveInstance(x));

        if (this._parent) {
            return values.concat(this._parent._getAll(identifier));
        }
        return values;
    }

    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean {
        return this._binders.has(identifier) || Boolean(this._parent && this._parent.has(identifier));
    }

    private _getPlan(identifier: Identifier): DependencyGraphNode {
        let plan = this._planCache.get(identifier);
        if (!plan) {
            // TODO: This is nasty.  Fix this up when planner gets its cleanup pass.
            const bindData = new Map<Identifier, BindingData[]>();
            for(let entry of this._binders) {
                bindData.set(entry[0], entry[1].map(x => x._getBinding()));
            }
            plan = createPlanForIdentifier(identifier, bindData);
            this._planCache.set(identifier, plan);
        }
        return plan;
    }
}
