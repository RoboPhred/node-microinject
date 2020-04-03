# node-microinject

# Microinject

A Tiny, standalone, library-friendly dependency injection container.

[Quick Start](/docs/Getting Started.md)

## Background

This was made out of a requirement to use dependency injection for a complex middleware library. The primary driving force is to allow a library to use dependency injection locally without forcing changes to any upstream users of the library.
This means:

- No requirements for the invoking library to initialize reflect-metadata.
- Support dependency injection when used on classes derived from non-DI-aware classes.
- No monkey patching anything external to the library.
- Minimum overhead.
- Works if multiple libraries independently try to use it.
- Works if npm installs multiple copies of the library.

Originally, I had used [InversifyJS](https://github.com/inversify/InversifyJS). However, it failed against the
first three requirements. The original incarnation of this library was born as an api-compatible replacement to
the subset of InversifyJS my projects were using.
Despite this, microinject is not a fork. It has been written from the ground up, and borrows InversifyJS conventions where appropriate.

# Design philosophy

This library intends to remain minimalist while still covering a decent set of use cases for dependency injection.
As this is intended to be used transparently by middleware libraries, it will not receive features intended for
application-level IoC.

## Common features with InversifyJS

- `container.bind.to`.
- `container.bind.toSelf`.
- `container.bind.toConstantValue`.
- `container.bind.toDynamicValue`.
- _container.bind.toFactory_ identical to `container.bind.toDynamicValue`.
- `container.bind.*.inSingletonScope`.
- `container.bind.*.inTransientScope`.
- `container.get`.
- `container.getAll`.
- `ContainerModule(bind => {...})` - Only `bind` argument is supported.
- `container.load`.
- `@injectable()`.
- `@inject(identifier)` - Constructor and Property injection supported. Identifier must be specified; inject-by-type not supported.
- `@optional` modifier for @inject.
- _@injectAll()_ = `@inject(identifier, {all: true})`.
- _child containers_ as `childContainer.parent = parentContainer;`;

## New features over InversifyJS

- Custom scopes: `container.bind.[toScope | inScope]` - create services shared based on other objects further up the chain.
- Per-request parameters: Supply per-request options to constructed instance in addition to traditional bindings.
  - Constructor parameter injection: `constructor(@injectParam("MyParam") myParam: string)`
  - Supply parameters during object request: `container.get(MyObjectIdentifier, {MyParam: "hello world"})`
- Decorator based binding: `container.bind(ClassConstructor)` will read annotations on the object:
  - Binding aliases: `@provides(identifier)`.
  - As a singleton: `@singleton`.
  - Inside a custom scope: `@inScope`.
  - Defining a custom scope: `@asScope`.
  - Can be overridden by standard binding api.
- Instantiate objects dynamically without bindings: `container.create()`
- Provide a single binding for multiple identifiers (using `@provides` and `bind().provides()`)
  - Simplify code by providing a single implementation while still keeping seperation of concerns
    with seperate identifiers.
- No [monkey patching required to extend NodeJS or third party classes](https://github.com/inversify/InversifyJS/issues/619#issuecomment-352218311).
- No requirement for the root node application to call [reflect-metadata](https://github.com/inversify/InversifyJS/issues/737). No risk of interfering with other modules that also use it.
- Minimialist API: No [redundant functions](https://github.com/inversify/InversifyJS/issues/697) for varying names of the same behavior.
- Lighter weight
  - node_module sizes (including explicit and implicit dependencies)
    - `npm i inversify@4.11.1 reflect-metadata@0.1.12` = 617 KB
    - `npm i microinject@0.4.0 uuid@3.2.1` = 137 KB
  - Code sizes
    - `inversify@4.11.1 ./lib` = 85.5 KB
    - `microinject@0.4.1 ./lib` = 53.6 KB

## Missing features from InversifyJS

- unbinding / rebinding
- [tagged binding](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md)
  - Binding aliases (`bind().provides()`) provides a more flexible solution to this use case.
- [debug tools](https://github.com/inversify/inversify-chrome-devtools)
- async modules
- async resolution
  - Use async provider objects instead: `class FooProvider { async getFoo() { ... }}`
- snapshotting
- Auto injection based on typescript typings
  - This requires using `reflect-metadata` and will not be supported.

## Alternatives

- [InversifyJS](https://github.com/inversify/InversifyJS) - Typescript-based full featured Dependency Injection.
- [Electrolyte](https://github.com/jaredhanson/electrolyte) - A commonjs-centric dependency injection mechanism that functions at the module level.
- [typescript-ioc](https://www.npmjs.com/package/typescript-ioc) - Single-container global-scoped IOC using Typescript and reflect-metadata.

### Which one should I choose?

If you are making a third party library for consumption by others, and want to avoid monkey patching, global state, and other leaky concepts, consider using microinject.

If your application generates a hierarchy of components where some components have multiple instances, and you need to share services within each instance, you may find microinject's scoped bindings useful.

If your application needs to pass instance specific data when generating multiple instances of the same identifier, microinject's parameter injection is what you need.

If you want your DI container to automatically determine your bindings from used types, use [InversifyJS](https://github.com/inversify/InversifyJS).

If you are working with older environments, or want to stay closer to the commonjs module format, use [Electrolyte](https://github.com/jaredhanson/electrolyte).

## JS Environment Compatibility

The primary target of this library is NodeJS v10 and up. However, it will work with modern browsers or babel so long as Symbol and Map are supported.
