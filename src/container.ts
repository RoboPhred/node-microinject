import { v4 as uuidV4 } from "uuid";

import { Context, Identifier, Newable, RegistryModule } from "./interfaces";

import { Binder } from "./binder";

import { BinderImpl } from "./binder/binder-impl";

import { Binding } from "./binder/binding";

import {
  DependencyGraphPlanner,
  FactoryDependencyNode,
  ParentDependencyNode,
} from "./planner";

import {
  BasicDependencyGraphResolver,
  DependencyGraphResolver,
  ResolveOpts,
  ParameterRecord,
} from "./resolver";

import { DependencyResolutionError } from "./errors";

export class Container {
  private _planner: DependencyGraphPlanner;
  private _resolver: BasicDependencyGraphResolver;

  private _pendingBinders = new Set<BinderImpl>();
  private _bindingMap = new Map<Identifier, Binding[]>();

  /**
   * Container to use if a binding is not find in this container.
   */
  private _parent: Container | null = null;

  constructor() {
    this._planner = new DependencyGraphPlanner(
      this._resolveBindings.bind(this)
    );

    this._resolver = new BasicDependencyGraphResolver({
      factory: this._factoryResolver.bind(this),
      parentIdentifier: this._parentResolver.bind(this),
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
  load(...modules: RegistryModule[]) {
    const bind = this.bind.bind(this);
    modules.forEach((x) => x.registry(bind));
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
    this._pendingBinders.add(binder);

    return binder;
  }

  /**
   * Resolve all pending binding operations.
   *
   * This is useful to forcefully resolve all binding operations
   * ahead of their actual use, and provides an ahead-of-time check
   * for invalid bindings without waiting for those bindings to be used.
   */
  resolveAllBindings() {
    this._finalizeBinders();
  }

  hasBinding(identifier: Identifier): boolean {
    this._finalizeBinders(identifier);

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
      factory: this._factoryResolver.bind(this),
    });

    // No need to clear the cached plans.  Bindings are kept,
    //  so the plans are still valid.
  }

  create<T>(ctor: Newable<T>, parameters: ParameterRecord = {}) {
    return this._create(ctor, parameters, this._resolver);
  }

  private _create<T>(
    ctor: Newable<T>,
    parameters: ParameterRecord,
    resolver: DependencyGraphResolver
  ): T {
    // TODO: Allow passing values to decorated ctor args `@param("foo") myFoo: number`.
    const binder = new BinderImpl(ctor);
    binder.to(ctor).inTransientScope();
    const binding = binder._getBinding();
    const plan = this._planner.getPlan(ctor, binding, { noCache: true });
    return resolver.resolveInstance(plan, { parameters });
  }

  /**
   * Gets or creates the value represented by the identifier.
   * This method will throw DependencyResolutionError if there is not exactly one binding for the identifier.
   * @param identifier The identifier of the object to get.
   * @returns The object for the given identifier.
   */
  get<T>(identifier: Identifier<T>, parameters: ParameterRecord = {}): T {
    return this._get(identifier, parameters);
  }

  private _get<T>(
    identifier: Identifier<T>,
    parameters: ParameterRecord,
    resolver?: DependencyGraphResolver,
    planner?: DependencyGraphPlanner
  ): T {
    if (!resolver) {
      resolver = this._resolver;
    }
    if (!planner) {
      planner = this._planner;
    }

    if (this.hasBinding(identifier)) {
      const plan = planner.getPlan(identifier);
      return resolver.resolveInstance(plan, { parameters });
    }

    if (this._parent) {
      return this._parent.get(identifier);
    }

    throw new DependencyResolutionError(
      identifier,
      [],
      `No bindings exists for the identifier.`
    );
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

  private _getAll<T>(
    identifier: Identifier<T>,
    resolver?: DependencyGraphResolver,
    planner?: DependencyGraphPlanner
  ) {
    const values = this._getAllNoThrow(identifier, resolver, planner);

    // This is the only point where we can throw, as we do not want an ancestor
    //  container throwing if it has none.
    //  Consider the case where the first and third ancestors have values, but the second does not.
    if (values.length === 0) {
      throw new DependencyResolutionError(
        identifier,
        [],
        `No bindings exists for the identifier.`
      );
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
  private _getAllNoThrow<T>(
    identifier: Identifier<T>,
    resolver?: DependencyGraphResolver,
    planner?: DependencyGraphPlanner
  ): T[] {
    if (!resolver) {
      resolver = this._resolver;
    }
    if (!planner) {
      planner = this._planner;
    }

    // Do not pass the resolver or planner to the parent,
    //  as it is an entirely new container with disjoint scopes.
    // Our scopes do not transcend containers.
    const values: T[] = this._parent
      ? this._parent._getAllNoThrow(identifier)
      : [];

    const bindings = this._resolveBindings(identifier, false);
    if (bindings.length > 0) {
      const plans = bindings.map((binding) =>
        planner!.getPlan(identifier, binding)
      );
      values.push(...plans.map((plan) => resolver!.resolveInstance(plan)));
    }

    return values;
  }

  /**
   * Checks if the given identifier is known to the container.
   * @param identifier The identifier to check for.
   */
  has<T>(identifier: Identifier<T>): boolean {
    return (
      this.hasBinding(identifier) ||
      Boolean(this._parent && this._parent.has(identifier))
    );
  }

  private _resolveBindings(
    identifier: Identifier,
    includeParent = true
  ): Binding[] {
    this._finalizeBinders(identifier);

    const bindings = this._bindingMap.get(identifier) || [];

    if (includeParent && this._parent && this._parent.has(identifier)) {
      bindings.push({
        bindingId: uuidV4(),
        identifiers: [identifier],
        type: "parent",
      });
    }

    return bindings;
  }

  private _finalizeBinders(identifier?: Identifier) {
    for (const binder of this._pendingBinders) {
      if (identifier && binder.identifiers.indexOf(identifier) === -1) {
        continue;
      }

      const binding = binder._getBinding();
      for (const identifier of binding.identifiers) {
        let bindingGroup = this._bindingMap.get(identifier);
        if (bindingGroup == undefined) {
          bindingGroup = [];
          this._bindingMap.set(identifier, bindingGroup);
        }
        bindingGroup.push(binding);
      }

      this._pendingBinders.delete(binder);
    }
  }

  /**
   * Resolver for factory bindings.
   *
   * We need to pass an argument to the function to allow it to resolve child objects,
   * and we need to pass it the root container as part of the InversifyJS api.
   *
   * @param identifier The identifier that was resolved to the factory we are resolving.
   * @param node The factory component creator to be used to resolve the value.
   * @param childResolver A resolver capable of resolving correctly scoped child objects.
   */
  private _factoryResolver(
    node: FactoryDependencyNode,
    childResolver: DependencyGraphResolver,
    opts: ResolveOpts
  ): any {
    const self = this;
    const context: Context = {
      get container() {
        return self;
      },

      get parameters() {
        return Object.seal({ ...opts.parameters });
      },

      create: <T>(ctor: Newable<T>, parameters: ParameterRecord = {}): T => {
        return this._create(ctor, parameters, childResolver);
      },

      get: (identifier: Identifier, parameters: ParameterRecord = {}) => {
        return this._get(identifier, parameters, childResolver, node.planner);
      },

      getAll: (identifier: Identifier) => {
        return this._getAll(identifier, childResolver);
      },

      // "has" is simply interested if we have at least one binding for the identifier.
      //  Scope has no bearing on its value, so it is not interested in
      has: this.has.bind(this),
    };

    return node.factory(context);
  }

  private _parentResolver(node: ParentDependencyNode, opts: ResolveOpts) {
    if (!this._parent) {
      throw new DependencyResolutionError(
        node.identifier,
        [],
        "Dependency graph planned a parent injection, but no parent container is available."
      );
    }
    return this._parent.get(node.identifier);
  }
}
