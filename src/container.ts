
import {
    Identifier,
    Context
} from "./interfaces";

import {
    ContainerModule
} from "./module";

import {
    Binder
} from "./binder";

import {
    BinderImpl
} from "./binder/binder-impl";

import {
    Binding
} from "./binder/data";

import {
    getProvidedIdentifiers
} from "./binder/utils";

import {
    DependencyNode,
    DependencyGraphPlanner,
    FactoryDependencyNode
} from "./planner";

import {
    DependencyGraphResolver,
    BasicDependencyGraphResolver
} from "./resolver";

import {
    DependencyResolutionError
} from "./errors";


export class Container {
    private _planner: DependencyGraphPlanner;
    private _resolver: BasicDependencyGraphResolver;

    private _bindingMap = new Map<Identifier, BinderImpl[]>();

    /**
     * Container to use if a binding is not find in this container.
     */
    private _parent: Container | null = null;

    constructor() {
        this._planner = new DependencyGraphPlanner(
            this._resolveBindings.bind(this)
        );

        this._resolver = new BasicDependencyGraphResolver({
            factory: this._factoryResolver.bind(this)
        });
    }


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
    bind<T>(identifier: Identifier<T>): Binder<T> {
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
        let binders = this._bindingMap.get(identifier);
        if (!binders) {
            binders = [];
            this._bindingMap.set(identifier, binders);
        }
        binders.push(binder);
    }

    hasBinding(identifier: Identifier): boolean {
        const binders = this._bindingMap.get(identifier);
        return Boolean(binders && binders.length > 0);
    }

    /**
     * Clears out knowledge of all resolved identifiers and scopes.
     * Previously resolved objects and factories will still
     * continue to work off the old data.
     * 
     * This does not clear the container's bindings.  All previously
     * configured bindings remain configured.
     */
    reset() {
        // Clearing the entire scope stack is as simple as getting
        //  a new graph resolver.
        this._resolver = new BasicDependencyGraphResolver({
            factory: this._factoryResolver.bind(this)
        });

        // No need to clear the cached plans.  Bindings are kept,
        //  so the plans are still valid.
    }

    /**
     * Gets or creates the value represented by the identifier.
     * This method will throw DependencyResolutionError if there is not exactly one binding for the identifier.
     * @param identifier The identifier of the object to get.
     * @returns The object for the given identifier.
     */
    get<T>(identifier: Identifier<T>): T {
        return this._get(identifier);
    }

    private _get<T>(identifier: Identifier<T>, resolver?: DependencyGraphResolver): T {
        if (!resolver) resolver = this._resolver;

        if (this.hasBinding(identifier)) {
            const plan = this._planner.getPlan(identifier);
            return resolver.resolveInstance(plan);
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
        return this._getAll(identifier);
    }

    private _getAll<T>(identifier: Identifier<T>, resolver?: DependencyGraphResolver) {
        const values = this._getAllNoThrow(identifier, resolver);

        // This is the only point where we can throw, as we do not want an ancestor
        //  container throwing if it has none.
        //  Consider the case where the first and third ancestors have values, but the second does not.
        if (values.length === 0) {
            throw new DependencyResolutionError(identifier, [], `No bindings exists for the identifier.`);
        }
        return values;
    }

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
    private _getAllNoThrow<T>(identifier: Identifier<T>, resolver?: DependencyGraphResolver): T[] {
        if (!resolver) resolver = this._resolver;

        // Do not pass the resolver to the parent, as it is an entirely new container
        //  with disjoint scopes.
        // Our scopes do not transcend containers.
        const values: T[] = this._parent ? this._parent._getAllNoThrow(identifier) : [];

        const bindings = this._resolveBindings(identifier);
        if (bindings.length > 0) {
            const plans = bindings.map(binding => this._planner.getPlan(identifier, binding));
            values.push(...plans.map(plan => resolver!.resolveInstance(plan)));
        }

        return values;
    }

    /**
     * Checks if the given identifier is known to the container.
     * @param identifier The identifier to check for.
     */
    has<T>(identifier: Identifier<T>): boolean {
        return this.hasBinding(identifier) || Boolean(this._parent && this._parent.has(identifier));
    }

    private _resolveBindings(identifier: Identifier): Binding[] {
        const binders = this._bindingMap.get(identifier);
        if (binders) return binders.map(x => x._getBinding());
        return [];
    }

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
    private _factoryResolver(
        identifier: Identifier,
        creator: FactoryDependencyNode,
        childResolver: DependencyGraphResolver
    ): any {
        const container = this;
        
        const context: Context = {
            container,

            // "has" is simply interested if we have at least one binding for the identifier.
            //  Scope has no bearing on its value, so it is not interested in
            has: container.has.bind(container),

            get(identifier: Identifier) {
                return container._get(identifier, childResolver);
            },

            getAll(identifier: Identifier) {
                return container._getAll(identifier, childResolver)
            }
        }

        return creator.factory(context);
    }
}
