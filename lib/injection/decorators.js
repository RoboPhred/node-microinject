"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("../binder/symbols");
const symbols_2 = require("./symbols");
/**
 * Marks this class as injectable.
 * Injectable classes can be created by a container.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
function injectable(identifier) {
    return function (target) {
        target[symbols_2.ClassIsInjectableKey] = true;
        if (identifier) {
            if (target[symbols_1.AutobindIdentifiersKey] == null) {
                target[symbols_1.AutobindIdentifiersKey] = [];
            }
            target[symbols_1.AutobindIdentifiersKey].push(identifier);
        }
    };
}
exports.injectable = injectable;
/**
 * Marks a constructor argument or object propertie as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
function inject(identifier, opts) {
    return function (target, targetKey, index) {
        if (index != null) {
            // Constructor arguments
            let dependencies = target[symbols_2.ConstructorInjectionsKey];
            if (dependencies == null) {
                dependencies = [];
                target[symbols_2.ConstructorInjectionsKey] = dependencies;
            }
            dependencies[index] = Object.assign({}, (dependencies[index] || {}), (opts || {}), { identifier });
        }
        else {
            // Properties
            let properties = target[symbols_2.PropertyInjectionsKey];
            if (properties == null) {
                properties = new Map();
                target[symbols_2.PropertyInjectionsKey] = properties;
            }
            let data = properties.get(targetKey);
            if (!data) {
                data = Object.assign({}, opts, { identifier });
                properties.set(targetKey, data);
            }
            else {
                data.identifier = identifier;
            }
        }
    };
}
exports.inject = inject;
/**
 * Marks a constructor argument or object property as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
function optional() {
    return function (target, targetKey, index) {
        if (index != null) {
            // Constructor arguments
            let dependencies = target[symbols_2.ConstructorInjectionsKey];
            if (dependencies == null) {
                dependencies = [];
                target[symbols_2.ConstructorInjectionsKey] = dependencies;
            }
            if (dependencies[index] == null) {
                // @Optional can be applied before @Inject.
                dependencies[index] = {};
            }
            dependencies[index].optional = true;
        }
        else {
            // Properties
            // Properties
            let properties = target[symbols_2.PropertyInjectionsKey];
            if (properties == null) {
                properties = new Map();
                target[symbols_2.PropertyInjectionsKey] = properties;
            }
            let data = properties.get(targetKey);
            if (!data) {
                data = {};
                properties.set(targetKey, data);
            }
            data.optional = true;
            ;
        }
    };
}
exports.optional = optional;
//# sourceMappingURL=decorators.js.map