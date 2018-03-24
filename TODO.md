
# Documentation
- Examples.
Particularly how to use Identifier<T> to create a Symbol that will make container.get() return the desired type.


# Features
- Tagged binding.

# Cleanup
- Unit test everything.
- Ensure the engine limitation is set correctly; what nodejs versions support Map and Symbol?
- Stop generating typedefs for non-exported / internal files.
- Rework Binder/BinderImpl to prevent user access of _getBinding, _createDefaultBinding, _ensureCanBind
- Refactor to build an object graph and plan before instantiation for infinite loop detection and tracing capability.