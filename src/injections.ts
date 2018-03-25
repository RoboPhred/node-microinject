
import {
    Identifier
} from "./interfaces";

import {
    InjectableSymbol,
    AutobindIdentifierSymbol,
    ConstructorInjectionsSymbol
} from "./symbols";

import {
    InjectionData
} from "./injection-utils";


/**
 * Options for content injections.
 */
export interface InjectionOptions {
    /**
     * If true, the injected value will be null if no viable object is found in the container
     * If false, an error will be thrown at class creation time.
     */
    optional?: boolean;

    /**
     * Whether to set the variable to an array of all objects matching the identifier.
     * If true, the value will be an array of all matching objects.
     * If false, the first identified object will be used.
     * 
     * Note that 'optional' is still required to avoid throwing an error if no objects are found.
     * If both 'optional' and 'all' are true, then an empty array will be set if no objects are found.
     */
    all?: boolean;
}

/**
 * Marks this class as injectable.
 * Optionally allows an alias to be specified.
 * @param aliasIdentifier The identifier this class will use when auto-bound (ie: the object is passed as the identifier to container.bind()).
 */
export function Injectable<TFunction extends Function>(aliasIdentifier?: Identifier): (target: TFunction) => void {
    return function(target: any) {
        target[InjectableSymbol] = true;
        if (aliasIdentifier) {
            if (target[AutobindIdentifierSymbol] == null) target[AutobindIdentifierSymbol] = [];
            target[AutobindIdentifierSymbol].push(aliasIdentifier);
        }
    }
}

/**
 * Specifies an alternate identifier to be used .
 * @param aliasIdentifier The identifier to automatically bind this class to when bound without additional configuration.
 */
export function Alias<TFunction extends Function>(aliasIdentifier: Identifier): (target: TFunction) => void {
    return function(target: any) {
        if (target[AutobindIdentifierSymbol] == null) target[AutobindIdentifierSymbol] = [];
        target[AutobindIdentifierSymbol].push(aliasIdentifier);
    }
}

/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export function Inject(identifier: Identifier, opts?: InjectionOptions) {
    return function(target: any, targetKey: string, index: number) {
        let dependencies = target[ConstructorInjectionsSymbol] as InjectionData[];
        if (dependencies == null) {
            dependencies = [];
            target[ConstructorInjectionsSymbol] = dependencies;
        }
        dependencies[index] = {
            ...(opts || {}),
            identifier: identifier
        };
    }
}

/**
 * Marks an injectable constructor argument as being optional.
 * This has no effect if the argument is not annotated with @Inject().
 * This annotation is not order sensitive.  It can come before or after @Inject().
 */
export function Optional() {
    return function(target: any, targetKey: string, index: number) {
        let dependencies = target[ConstructorInjectionsSymbol] as InjectionData[];
        if (dependencies == null) {
            dependencies = [];
            target[ConstructorInjectionsSymbol] = dependencies;
        }
        if (dependencies[index] == null) {
            dependencies[index] = {identifier: undefined};
        }
        dependencies[index].optional = true;
    } 
}
