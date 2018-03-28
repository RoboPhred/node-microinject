
# Features
- Tagged binding.
- Graph construction should be pluggable
    - Allows cleaner code and easier addition of additional binding features, such as tagged or conditional bindings.
- Explore alternate dependency graph resolvers for different use cases
    - Mixins, wrapped functions.
    - Remoted calls, for example over an IPC bus or microservice architecture.
    - Ensure typings can understand these transformations (eg promisify).  Will require [typescript foo](https://github.com/Microsoft/TypeScript/pull/21496).


# Bugs
- Mixing @Provides and @InScope will create a new copy per each @Provides.  This is because Identifier is the identification mechanism for
instances within a scope, and by the time the planner sees things, each @Provides identifier shows up seperately.  @InScope should really
apply to the binding / auto-bound object as a whole.  This would become obvious if we had an .alias() method on the binding object.


# Cleanup
- Unit test everything.
- Ensure the engine limitation is set correctly; what nodejs versions support Map and Symbol?
- Stop generating typedefs for non-exported / internal files.
- Rework BinderImpl to prevent user access of internal methods.
- Clean up BinderData vs BinderImpl issues.  We currently have to pass BinderImpl to the planner in order to generate the 
actual binding configuration as late as possible, as we do not know when the user is finished setting it up.