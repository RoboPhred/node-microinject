"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
/**
 * Marks this class as injectable.
 * Optionally allows an alias to be specified.
 * @param aliasIdentifier The identifier this class will use when auto-bound (ie: the object is passed as the identifier to container.bind()).
 */
function Injectable(aliasIdentifier) {
    return function (target) {
        target[symbols_1.InjectableSymbol] = true;
        if (aliasIdentifier) {
            if (target[symbols_1.AutobindIdentifierSymbol] == null)
                target[symbols_1.AutobindIdentifierSymbol] = [];
            target[symbols_1.AutobindIdentifierSymbol].push(aliasIdentifier);
        }
    };
}
exports.Injectable = Injectable;
/**
 * Specifies an alternate identifier to be used .
 * @param aliasIdentifier The identifier to automatically bind this class to when bound without additional configuration.
 */
function Alias(aliasIdentifier) {
    return function (target) {
        if (target[symbols_1.AutobindIdentifierSymbol] == null)
            target[symbols_1.AutobindIdentifierSymbol] = [];
        target[symbols_1.AutobindIdentifierSymbol].push(aliasIdentifier);
    };
}
exports.Alias = Alias;
/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
function Inject(identifier, opts) {
    return function (target, targetKey, index) {
        let dependencies = target[symbols_1.ConstructorInjectionsSymbol];
        if (dependencies == null) {
            dependencies = [];
            target[symbols_1.ConstructorInjectionsSymbol] = dependencies;
        }
        dependencies[index] = Object.assign({}, (opts || {}), { identifier: identifier });
    };
}
exports.Inject = Inject;
/**
 * Marks an injectable constructor argument as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This annotation is not order sensitive.  It can come before or after @Inject().
 */
function Optional() {
    return function (target, targetKey, index) {
        let dependencies = target[symbols_1.ConstructorInjectionsSymbol];
        if (dependencies == null) {
            dependencies = [];
            target[symbols_1.ConstructorInjectionsSymbol] = dependencies;
        }
        if (dependencies[index] == null) {
            dependencies[index] = { identifier: undefined };
        }
        dependencies[index].optional = true;
    };
}
exports.Optional = Optional;
//# sourceMappingURL=injections.js.map