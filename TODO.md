
# Immediate tasks
- Reimplement context argument for factory; change context to only allow .get() and .getAll() from container to divorse it from needing the entire container
and allowing container.reset() to cut ties with it.
- Clean up planner; give it the same treatment as the resolver.  Lots of args passed along that should be instance props of the class.
- Rework how bindings are sent to planner.  The need to map the values of the container's binding map is nonsensical.  Should probably
    just send an array of bindings, and let the binding hold one or more identifiers.  This will also enable me to fix the @Provides+@InScope bug.
    Best solution is probably to make BinderImpl implement BinderData.  Could do it through read-only props.


# Features
- Tagged binding.
- Graph construction should be pluggable
    - Allows cleaner code and easier addition of additional binding features, such as tagged or conditional bindings.
- Take dependency graph and run it against pluggable / swappable resolver.  This allows for additional cross-cutting features:
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