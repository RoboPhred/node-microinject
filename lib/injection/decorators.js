"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../symbols");
const symbols_2 = require("./symbols");
/**
 * Marks this class as injectable.
 * Injectable classes can be created by a container.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
function Injectable(identifier) {
    return function (target) {
        target[symbols_2.InjectableDecoratorSymbol] = true;
        if (identifier) {
            if (target[symbols_1.AutobindIdentifierSymbol] == null)
                target[symbols_1.AutobindIdentifierSymbol] = [];
            target[symbols_1.AutobindIdentifierSymbol].push(identifier);
        }
    };
}
exports.Injectable = Injectable;
/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
function Inject(identifier, opts) {
    return function (target, targetKey, index) {
        let dependencies = target[symbols_2.ConstructorInjectionDecoratorsSymbol];
        if (dependencies == null) {
            dependencies = [];
            target[symbols_2.ConstructorInjectionDecoratorsSymbol] = dependencies;
        }
        dependencies[index] = Object.assign({}, (opts || {}), { identifier: identifier });
    };
}
exports.Inject = Inject;
/**
 * Marks an injectable constructor argument as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
function Optional() {
    return function (target, targetKey, index) {
        let dependencies = target[symbols_2.ConstructorInjectionDecoratorsSymbol];
        if (dependencies == null) {
            dependencies = [];
            target[symbols_2.ConstructorInjectionDecoratorsSymbol] = dependencies;
        }
        if (dependencies[index] == null) {
            // @Optional can be applied before @Inject.
            dependencies[index] = {};
        }
        dependencies[index].optional = true;
    };
}
exports.Optional = Optional;
//# sourceMappingURL=decorators.js.map