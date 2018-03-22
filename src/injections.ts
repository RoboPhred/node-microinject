
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
    optional?: boolean;
}

/**
 * Marks this class as injectable.
 * @param autobindIdentifier The identifier this class will use when auto-bound (ie: the object is passed as the identifier to container.bind()).
 */
export function injectable<TFunction extends Function>(autobindIdentifier?: Identifier): (target: TFunction) => void {
    return function(target: any) {
        target[InjectableSymbol] = true;
        if (autobindIdentifier) {
            target[AutobindIdentifierSymbol] = autobindIdentifier;
        }
    }
}

/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export function inject(identifier: Identifier, opts?: InjectionOptions) {
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
export function optional() {
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
