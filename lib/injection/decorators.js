"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binder_1 = require("../binder");
const symbols_1 = require("./symbols");
/**
 * Marks this class as injectable.
 * Injectable classes can be injected by a container into injectables.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for `@injectable() @provides(identifier)`.
 */
function injectable(identifier) {
    return function (target) {
        target[symbols_1.ClassIsInjectableKey] = true;
        if (identifier) {
            binder_1.provides(identifier)(target);
        }
    };
}
exports.injectable = injectable;
function getInjectionTargetData(target, targetKey, index) {
    if (index != null) {
        // Constructor arguments
        let dependencies = target[symbols_1.ConstructorInjectionsKey];
        if (dependencies == null) {
            dependencies = [];
            target[symbols_1.ConstructorInjectionsKey] = dependencies;
        }
        if (dependencies[index] == null) {
            dependencies[index] = {};
        }
        return dependencies[index];
    }
    else {
        // Properties
        let properties = target[symbols_1.PropertyInjectionsKey];
        if (properties == null) {
            properties = new Map();
            target[symbols_1.PropertyInjectionsKey] = properties;
        }
        let data = properties.get(targetKey);
        if (!data) {
            data = {};
            properties.set(targetKey, data);
        }
        return data;
    }
}
/**
 * Marks a constructor argument or object propertie as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
function inject(identifier, opts) {
    return function (target, targetKey, index) {
        const data = getInjectionTargetData(target, targetKey, index);
        Object.assign(data, opts, {
            identifier
        });
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
        const data = getInjectionTargetData(target, targetKey, index);
        data.optional = true;
    };
}
exports.optional = optional;
/**
 * Marks a constructor argument or object property as receiving all injectable values.
 * The target value will be set to an array of all registered objects.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
function all() {
    return function (target, targetKey, index) {
        const data = getInjectionTargetData(target, targetKey, index);
        data.all = true;
    };
}
exports.all = all;
//# sourceMappingURL=decorators.js.map