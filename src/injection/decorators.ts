
import {
    AutobindIdentifiersKey
} from "../binder/symbols";

import {
    Identifier
} from "../interfaces";

import {
    InjectionOptions
} from "./interfaces";

import {
    ClassIsInjectableKey,
    ConstructorInjectionsKey,
    PropertyInjectionsKey
} from "./symbols";

import {
    InjectionData
} from "./utils";


/**
 * Marks this class as injectable.
 * Injectable classes can be created by a container.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
export function injectable<TFunction extends Function>(identifier?: Identifier): (target: TFunction) => void {
    return function (target: any) {
        target[ClassIsInjectableKey] = true;
        if (identifier) {
            if (target[AutobindIdentifiersKey] == null) {
                target[AutobindIdentifiersKey] = [];
            }
            target[AutobindIdentifiersKey].push(identifier);
        }
    };
}

/**
 * Marks a constructor argument or object propertie as being injectable.
 * The object must be marked @injectable for injection to take place.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export function inject(identifier: Identifier, opts?: InjectionOptions) {
    return function (target: any, targetKey: string, index?: number) {
        if (index != null) {
            // Constructor arguments
            let dependencies = target[ConstructorInjectionsKey] as InjectionData[];
            if (dependencies == null) {
                dependencies = [];
                target[ConstructorInjectionsKey] = dependencies;
            }
            dependencies[index] = {
                ...(dependencies[index] || {}),
                ...(opts || {}),
                identifier
            };
        }
        else {
            // Properties
            let properties = target[PropertyInjectionsKey] as Map<string, InjectionData>;
            if (properties == null) {
                properties = new Map();
                target[PropertyInjectionsKey] = properties;
            }
            let data = properties.get(targetKey);
            if (!data) {
                data = {
                    ...opts,
                    identifier
                };
                properties.set(targetKey, data)
            }
            else {
                data.identifier = identifier;
            }
        }
    };
}

/**
 * Marks a constructor argument or object property as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
export function optional() {
    return function (target: any, targetKey: string, index?: number) {
        if (index != null) {
            // Constructor arguments
            let dependencies = target[ConstructorInjectionsKey] as InjectionData[];
            if (dependencies == null) {
                dependencies = [];
                target[ConstructorInjectionsKey] = dependencies;
            }
            if (dependencies[index] == null) {
                // @Optional can be applied before @Inject.
                dependencies[index] = {} as any;
            }
            dependencies[index].optional = true;
        }
        else {
            // Properties
            // Properties
            let properties = target[PropertyInjectionsKey] as Map<string, InjectionData>;
            if (properties == null) {
                properties = new Map();
                target[PropertyInjectionsKey] = properties;
            }
            let data = properties.get(targetKey);
            if (!data) {
                data = {} as InjectionData;
                properties.set(targetKey, data)
            }
            data.optional = true;;
        }
    };
}
