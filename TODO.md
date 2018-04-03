
# Features
- Tagged binding.
- Graph construction should be pluggable
    - Allows cleaner code and easier addition of additional binding features, such as tagged or conditional bindings.
- Explore alternate dependency graph resolvers for different use cases
    - Mixins, wrapped functions.
    - Remoted calls, for example over an IPC bus or microservice architecture.
    - Ensure typings can understand these transformations (eg promisify).  Will require [typescript foo](https://github.com/Microsoft/TypeScript/pull/21496).


# Cleanup
- Unit test remaining components.
- Integration tests for explicit binding syntax.
- Ensure the engine limitation is set correctly; what nodejs versions support Map and Symbol?
- Extract typedefs out of npm package and into @types/microinject.
- Stop generating typedefs for non-exported / internal files.
- Rework BinderImpl to prevent user access of internal methods.
