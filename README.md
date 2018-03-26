# node-microinject
A Tiny, standalone, library-friendly dependency injection container.

This was made out of a requirement to use dependency injection for a complex middleware library.  The primary 
driving force is allow a library to use dependency injection locally without forcing changes to any upstream users of the library.
This means:
- No requirements for the invoking library to initialize reflect-metadata.
- Support dependency injection when used on classes derived from non-DI-aware classes.
- No monkey patching anything external to the library.
- Mimimum overhead.
- Works if multiple libraries independently try to use it.
- Works if node installs multiple copies of it.

Originally, I had used [InversifyJS](https://github.com/inversify/InversifyJS).  However, it failed against the
first three requirements.  The original incarnation of this library was born as an api-compatible replacement to
the subset of InversifyJS my projects were using.
Despite this, microinject is not a fork.  It has been written from the ground up, and borrows InversifyJS conventions where appropriate.

This incarnation of the library is once again a rewrite, as the original has been lost.  As such, this library has little real-world testing
and no adopters to speak of.  Tests are forthcomming, but be sure to evaluate its behavior for correctness before using it in your own
projects.

# Design philosophy

This library intends to remain minimalist while still covering a decent set of use cases for dependency injection.
As this is intended to be used transparently by middleware libraries, it will not receive features intended for
application-level IoC.

# Benefits over InfersifyJS
- No [monkey patching of base or third party superclasses](https://github.com/inversify/InversifyJS/issues/619#issuecomment-352218311).
- Microinject can be used transparently to consumers of your own library.  No [reflect-metadata](https://github.com/inversify/InversifyJS/issues/737) or monkey patching required.
- Minimialist API: No redundant api calls for varying names of the same behavior.  No more questions of "Should I use toFactory or toDynamicValue?".

# Drawbacks over InversifyJS
- Lacking [powerful debug tools](https://github.com/inversify/inversify-chrome-devtools).
- No [conditional binding](https://github.com/inversify/InversifyJS/blob/master/wiki/named_bindings.md).
- No [tagged binding](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md).
- No [property injection](https://github.com/inversify/InversifyJS/blob/master/wiki/property_injection.md).
- No [hierarichal containers](https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md).
- No typescript-based injection-by-type.  This is a result of being unable to use reflect-metadata.
- Less established and proven.

*Not all of these drawbacks are by design, and additional features may be forthcomming.*

# Which one should I choose?

If you are making a third party library for consumption by others, and do not want to require them to adopt InversifyJS and its usage requirements, consider using Microinject.

If you are making a NodeJS application and want a full featured and robust dependency injection / IoC suite, use [InversifyJS](https://github.com/inversify/InversifyJS).

# Compatibility

The primary target of this library is NodeJS libraries.
It may be possible to bundle this library for browser support, but only if ES6 Symbol and Map are supported or shimmed.

# Development

This is a rebuild of a private incarnation of this project.
Unit tests and examples are forthcomming.


# Alternatives
- [InversifyJS](https://github.com/inversify/InversifyJS) - Typescript-based full featured Dependency Injection.  Recommended for most application-level projects.
- [Electrolyte](https://github.com/jaredhanson/electrolyte) - A commonjs-centric dependency injection mechanism that functions at the module level.
- [typescript-ioc](https://www.npmjs.com/package/typescript-ioc) - Single-container global-scoped IOC using Typescript and reflect-metadata.
