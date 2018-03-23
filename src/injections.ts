
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
 * Optionally allows the specification of an autobind identifier.
 * @param autobindIdentifier The identifier this class will use when auto-bound (ie: the object is passed as the identifier to container.bind()).
 */
export function Injectable<TFunction extends Function>(autobindIdentifier?: Identifier): (target: TFunction) => void {
    return function(target: any) {
        target[InjectableSymbol] = true;
        if (autobindIdentifier) {
            if (target[AutobindIdentifierSymbol] == null) target[AutobindIdentifierSymbol] = [];
            target[AutobindIdentifierSymbol].push(autobindIdentifier);
        }
    }
}

/**
 * Marks the class with an autobind identifier.
 * @param autobindIdentifier The identifier to automatically bind this class to when bound without additional configuration.
 */
export function AutobindTo<TFunction extends Function>(autobindIdentifier: Identifier): (target: TFunction) => void {
    return function(target: any) {
        if (target[AutobindIdentifierSymbol] == null) target[AutobindIdentifierSymbol] = [];
        target[AutobindIdentifierSymbol].push(autobindIdentifier);
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
