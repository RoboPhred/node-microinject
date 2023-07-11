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
    if (targetKey === undefined && index != null) {
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
    else if (targetKey) {
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
    else {
        throw new Error("Invalid injection target");
    }
}
/**
 * Marks a constructor argument or object property as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
function inject(identifier, opts) {
    return function (target, targetKey, index) {
        const data = getInjectionTargetData(target, targetKey, index);
        Object.assign(data, opts, {
            type: "identifier",
            identifier,
        });
    };
}
exports.inject = inject;
/**
 * Marks a constructor argument or object property as receiving a param when created from `ServiceLocator.create()`.
 * @param paramName The identifier of the parameter to use.
 */
function injectParam(paramKey, opts) {
    return function (target, targetKey, index) {
        const data = getInjectionTargetData(target, targetKey, index);
        Object.assign(data, opts, {
            type: "parameter",
            paramKey: paramKey,
        });
    };
}
exports.injectParam = injectParam;
/**
 * Marks an object property as receiving a scope provider object.
 * Because the scope must be fully constructed to be injected, this can only be done to an object property.
 * @param paramName The identifier of the parameter to use.
 */
function injectScope(scope) {
    return function (target, targetKey, index) {
        const data = getInjectionTargetData(target, targetKey, index);
        Object.assign(data, {
            type: "scope",
            scope,
        });
    };
}
exports.injectScope = injectScope;
//# sourceMappingURL=decorators.js.map