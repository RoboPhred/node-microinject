"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
/**
 * Marks this class as injectable.
 * @param autobindIdentifier The identifier this class will use when auto-bound (ie: the object is passed as the identifier to container.bind()).
 */
function injectable(autobindIdentifier) {
    return function (target) {
        target[symbols_1.InjectableSymbol] = true;
        if (autobindIdentifier) {
            target[symbols_1.AutobindIdentifierSymbol] = autobindIdentifier;
        }
    };
}
exports.injectable = injectable;
/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
function inject(identifier, opts) {
    return function (target, targetKey, index) {
        let dependencies = target[symbols_1.ConstructorInjectionsSymbol];
        if (dependencies == null) {
            dependencies = [];
            target[symbols_1.ConstructorInjectionsSymbol] = dependencies;
        }
        dependencies[index] = Object.assign({}, (opts || {}), { identifier: identifier });
    };
}
exports.inject = inject;
/**
 * Marks an injectable constructor argument as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This annotation is not order sensitive.  It can come before or after @Inject().
 */
function optional() {
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
exports.optional = optional;
