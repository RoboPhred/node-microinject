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
project was created as an api-compatible stand-in of the subset Inversify features I was using at the time.
Aside from the API signatures, no InversifyJS code was used in the making of this library.

# Design philosophy

This library intends to remain minimalist while still covering a decent set of use cases for dependency injection.
As this is intended to be used transparently by middleware libraries, it will not receive
features intended for application-level IoC.

It was originally created to provide a plugin architecture for third parties to add cross-cutting features, while remaining
completely transparent to the users of the library.


# Benefits over InfersifyJS
- No monkey patching of third party classes.
- Microinject can be used transparently to consumers of your own library.  No reflect-metadata or monkey patching required.

# Drawbacks over InversifyJS
- Lacking in many features (advanced scoping, async resolution, activation handlers, ...)
Some features may be added with time, if they do not interfere with the design philosophy.
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
