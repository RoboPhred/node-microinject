# Bugs

- Cyclic property dependencies in transient or cyclic scopes cause a stack overflow. These should be detected ahead of time.
  Example:

```
const S1 = "s1";
const S2 = "s2";

@injectable(A)
@inScope(S1)
@asScope(S2)
class A {
  @inject(B) b;
}

@injectable(B)
@inScope(S2)
@asScope(S1)
class B {
    @inject(A) a;
}

class Root {
    @inject(A) a;
}

// ... auto-bind all ...

container.get(Root)
```

- Invalid scoping setups go undetected and throw bad error messages. Example: Scoped item under a singleton item can never reach a scope.

# Features

- Better support for dynamic instantiated objects
  - Parameter injection: `container.create(Foo, {param1: 42})` => `constructor(@param("param1") param1: number) {}`
  - Allow container.create() to treat the created target as a scope
  - @injectScope() to inject the scoped value.
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
- Extract typedefs out of npm package and into @types/microinject.
- Stop generating typedefs for non-exported / internal files.
- Rework BinderImpl to prevent user access of internal methods.
