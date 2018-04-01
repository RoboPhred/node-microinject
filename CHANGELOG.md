
# develop
- Report the correct identifier in question when throwing over a circular dependency found in a constructor argument.
- Fix newly instantiated factories not receiving context after container.reset().

# 0.3.1
- Fix auto-binding not attempting to use decorator data from the target of the binding, such as in ```bind(identifier).to(autoBindableTarget)```
- Fix asScope bindings falling back to being singleton scopes when in an injected constructor argument.
- Fix identifier stack in error message on a cyclic dependency containing redundant or missing entries when asScope bindings are in play.

# 0.3.0
- Lower-case decorators to follow community standards and bring us back in line with InversifyJS.
- Fix asScope bindings acting as singleton scopes.

# 0.2.0
- Switch to using a dependency graph over imperative resolution.