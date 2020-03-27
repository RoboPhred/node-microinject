# vNext

- Improve error message when a class constructor binding is unresolved.

# 0.7.1

- Fix typings when `bind().provides` is used before the binding target.

# 0.7.0

- Add `provides()` to binder to allow binding multiple identifiers to one resolution.

# 0.6.1

- Remove debugger statement.

# 0.6.0

## Features

- Add `@all()` decorator to specify all matching targets. Equivalent to`@inject(identifier, { all: true })`
- Add `Container.create` and factory `context.create` to directly instantiate and inject an arbitrary constructor.
- Add `bind(Constructor).toSelf()`.

## Refactors

- Clean up planner logic.
- Identifiers are tracked by the Binder, rather than the container.

# 0.5.0

## Features

- Introduce property injection.
- Add postInstantiate resolution step to component resolver.

## Refactors

- Insignificantly trim bundle size by directly requesting uuid/v4.

# 0.4.1

## Bug Fixes

- Fix getAll() returning a copy of the first registered value per matched binding.

## Refactors

- Removed build and test code from npm package.

# 0.4.0

## Bug Fixes

- Report the correct identifier in question when throwing over a circular dependency found in a constructor argument.
- Fix newly instantiated factories not receiving context after container.reset().
- Fix multiple @provides annotations on a scoped or singleton class producing multiple non-scoped instances of the class.
- Fix optional injection.
- Fix DependencyResolutionError message formatting.

## Refactors

- More Tests!
- Eliminate ComponentCreator concept by making DependencyGraphNode inherit properties of Binding and include resolution data.
- Determine instance equality by instanceId rather than creator object reference equality.
- Progress to pluggable dependency graphing and resolution.

# 0.3.1

- Fix auto-binding not attempting to use decorator data from the target of the binding, such as in `bind(identifier).to(autoBindableTarget)`
- Fix asScope bindings falling back to being singleton scopes when in an injected constructor argument.
- Fix identifier stack in error message on a cyclic dependency containing redundant or missing entries when asScope bindings are in play.

# 0.3.0

- Lower-case decorators to follow community standards and bring us back in line with InversifyJS.
- Fix asScope bindings acting as singleton scopes.

# 0.2.0

- Switch to using a dependency graph over imperative resolution.
