# Bugs

- Invalid scoping setups go undetected and throw bad error messages. Example: Scoped item under a singleton item can never reach a scope.

# Features

- Better support for dynamic instantiated objects
  - Allow container.create() to treat the created target as a scope
  - @injectServiceLocator() to inject a service locator that properly resolves in the current scope.
- Tagged binding.
- Graph construction should be pluggable
  - Allows cleaner code and easier addition of additional binding features, such as tagged or conditional bindings.
- Explore alternate dependency graph resolvers for different use cases
  - Mixins, wrapped functions.
  - Remoted calls, for example over an IPC bus or microservice architecture.
  - Ensure typings can understand these transformations (eg promisify). Will require [typescript foo](https://github.com/Microsoft/TypeScript/pull/21496).

# Efficiency

- Minimize created objects
  - Do not generate empty arrays/maps for the bindings when no ctor arguments or properties are specified.

# Cleanup

- Unit test remaining components.
- Integration tests for explicit binding syntax.
- Ensure the engine limitation is set correctly; what nodejs versions support Map and Symbol?
- Stop generating typedefs for non-exported / internal files.
- Rework BinderImpl to prevent user access of internal methods.
