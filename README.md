# node-microinject
A Tiny, standalone, library-friendly dependency injection container.

This was made out of a requirement to use dependency injection for a complex middleware library.  The primary 
driving force is to allow parent libraries to be completely ignorant of its presence.
This means:
- No requirements for the parent library to initialize reflect-metadata.
- No throwing errors if an injectable class is derived from a non-injectable class.
- No requirements to [monkey-patch third party super classes](https://github.com/inversify/InversifyJS/issues/619).
- Mimimum overhead.

The API of this module is a subset of a legacy version of [InversifyJS](https://github.com/inversify/InversifyJS).

InversifyJS provided a good feature set, but failed on the first 3 requirements.  As a result, this
project was created as an api-compatible stand-in for a subset of InversifyJS features I was using at the time.
Despite this, it is not a fork, and has been written from the ground up.

# Design philosophy

This library intends to remain minimalist while still covering a decent set of use cases for dependency injection.
As this is intended to be used transparently by middleware libraries, it will not receive
features intended for application-level IoC.

It was originally created to provide a plugin architecture for third parties to add cross-cutting features, while remaining
completely transparent to the users of the library.


# Benefits over InfersifyJS
- No [monkey patching of base or third party superclasses](https://github.com/inversify/InversifyJS/issues/619#issuecomment-352218311).
- Microinject can be used transparently to consumers of your own library.  No [reflect-metadata](https://github.com/inversify/InversifyJS/issues/737) or monkey patching required.
- Minimialist API: No redundant api calls for varying names of the same behavior.  No more questions of "Should I use toFactory or toDynamicValue?".

# Drawbacks over InversifyJS
- Lacking [powerful debug tools](https://github.com/inversify/inversify-chrome-devtools).
- No [conditional binding](https://github.com/inversify/InversifyJS/blob/master/wiki/named_bindings.md)
- No [tagged binding](https://github.com/inversify/InversifyJS/blob/master/wiki/tagged_bindings.md).
- No [hierarichal containers](https://github.com/inversify/InversifyJS/blob/master/wiki/hierarchical_di.md).
- No typescript-based injection-by-type.  This is a result of being unable to use reflect-metadata.
- Less established and proven.


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
