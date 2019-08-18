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
- Mimimum overhead.
- Works if multiple libraries independently try to use it.
- Works if npm installs multiple copies of the library.

This project has its origins in [InversifyJS](https://github.com/inversify/InversifyJS) and its failure to deal with these requirements. The original incarnation of this library was born as an api-compatible replacement to
the subset of InversifyJS my projects were using. Despite this, microinject is not a fork. It has been written from the ground up, and borrows InversifyJS conventions where appropriate.

## Design philosophy

This library intends to remain minimalist while still covering a decent set of use cases for dependency injection.
As this is intended to be used transparently by middleware libraries, it will not receive features intended for
application-level IoC.

## Common features with InversifyJS

- `container.bind.to`.
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
- auto-binding: `container.bind(ClassConstructor)` will preconfigure the binding from annotations on the object.
  - Binding aliases: `@provides(identifier)`.
  - As a singleton: `@singleton`.
  - Inside a custom scope: `@inScope`.
  - Defining a custom scope: `@asScope`.
  - Can be overridden by standard binding api.
- Multiple identifiers to a single binding (using `@provides`)

## Missing features from InversifyJS

- unbinding
- [tagged binding](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md).
- [debug tools](https://github.com/inversify/inversify-chrome-devtools)
- async modules.
- async resolution.
- snapshotting.

## Benefits over InfersifyJS

- Intuitive, decorator based binding configuration.
- Scoped binding support.
- No [monkey patching of base or third party superclasses](https://github.com/inversify/InversifyJS/issues/619#issuecomment-352218311).
- No requirement for the root node application to call [reflect-metadata](https://github.com/inversify/InversifyJS/issues/737). No risk of interfering with modules that also use it.
- Minimialist API: No [redundant functions](https://github.com/inversify/InversifyJS/issues/697) for varying names of the same behavior.
- Lighter weight
  - node_module sizes (including explicit and implicit dependencies)
    - `npm i inversify@4.11.1 reflect-metadata@0.1.12` = 617 KB
    - `npm i microinject@0.4.0 uuid@3.2.1` = 137 KB
  - Code sizes
    - `inversify@4.11.1 ./lib` = 85.5 KB
    - `microinject@0.4.1 ./lib` = 53.6 KB

## Drawbacks over InversifyJS

- Missing IoC capabilities. See "Missing features from InversifyJS" above.
- Missing debug tools.
- No typescript-based injection-by-type. _requires reflect-metadata._

## Which one should I choose?

If you are making a third party library for consumption by others, and do not want to require them to adopt InversifyJS and its usage requirements, consider using Microinject.

If you are making a NodeJS application and want a full featured and robust dependency injection / IoC suite, use [InversifyJS](https://github.com/inversify/InversifyJS).

## Compatibility

The primary target of this library is NodeJS libraries. However, it will work with modern browsers or babel so long as ES6 Symbol and Map are supported.

## Alternatives

- [InversifyJS](https://github.com/inversify/InversifyJS) - Typescript-based full featured Dependency Injection. Recommended for most application-level projects.
- [Electrolyte](https://github.com/jaredhanson/electrolyte) - A commonjs-centric dependency injection mechanism that functions at the module level.
- [typescript-ioc](https://www.npmjs.com/package/typescript-ioc) - Single-container global-scoped IOC using Typescript and reflect-metadata.
