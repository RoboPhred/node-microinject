
# Documentation
- Examples.
Particularly how to use Identifier<T> to create a Symbol that will make container.get() return the desired type.


# Features
- Tagged binding.

# Cleanup
- Unit test everything.
- Clean up how scopes are handled and passed along.  The code is very fragile.
- Ensure the engine limitation is set correctly; what nodejs versions support Map and Symbol?
- Stop generating typedefs for non-exported / internal files.
- Rework Binder/BinderImpl to prevent user access of _getBinding, _createDefaultBinding, _ensureCanBind
- Refactor to build an object graph and plan before instantiation for infinite loop detection and tracing capability.
- We are holding a lot of data around that is only needed during the buildout phase of the object graph.
    - Consider reworking it to build a graph first, then instantiate objects based on it.
    - This seems to be how InversifyJS does things, judging from its documentation.

# 2.x

Rework to build a dependency graph before creating objects.
- Allows for cycle detection.
- Allows easier scoping, might allow to work without WeakMap.
- Allow graph to be requested without construction, for example to generate design documents or service bus architecture (see 'remoted calls' below).

Graph construction should be pluggable
- Allows cleaner code and easier addition of additional binding features, such as 
tagged or conditional bindings.

Take dependency graph and run it against pluggable / swappable resolver.
This allows for additional cross-cutting features:
- Mixins, wrapped functions.
- Remoted calls, for example over an IPC bus or microservice architecture.
Ensure typings can understand these transformations (eg promisify).  Will require [typescript foo](https://github.com/Microsoft/TypeScript/pull/21496).

