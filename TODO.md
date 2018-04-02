
# Features
- Tagged binding.
- Graph construction should be pluggable
    - Allows cleaner code and easier addition of additional binding features, such as tagged or conditional bindings.
- Explore alternate dependency graph resolvers for different use cases
    - Mixins, wrapped functions.
    - Remoted calls, for example over an IPC bus or microservice architecture.
    - Ensure typings can understand these transformations (eg promisify).  Will require [typescript foo](https://github.com/Microsoft/TypeScript/pull/21496).


# Cleanup
- Resolver needs another cleanup pass, after the hacks to properly handle scope roots needing to make new scope instance sets.
    Consider changing how the planner deals with this.  ComponentCreator object ref works up to a point, but when we create multiple
    transient objects the ref equality throws us off.
- Unit test everything.
- Ensure the engine limitation is set correctly; what nodejs versions support Map and Symbol?
- Stop generating typedefs for non-exported / internal files.
- Rework BinderImpl to prevent user access of internal methods.
- Clean up BinderData vs BinderImpl issues.  We currently have to pass BinderImpl to the planner in order to generate the 
    actual binding configuration as late as possible, as we do not know when the user is finished setting it up.