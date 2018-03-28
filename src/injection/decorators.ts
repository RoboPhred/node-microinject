
import {
    Identifier
} from "../interfaces";

import {
    InjectionOptions
} from "./interfaces";

import {
    AutobindIdentifierSymbol
} from "../symbols";

import {
    InjectableDecoratorSymbol,
    ConstructorInjectionDecoratorsSymbol
} from "./symbols";

import {
    InjectionData
} from "./utils";


/**
 * Marks this class as injectable.
 * Injectable classes can be created by a container.
 * @param identifier An optional identifier to auto-bind this function as.  This is a shorthand for @Provide(identifier)
 */
export function Injectable<TFunction extends Function>(identifier?: Identifier): (target: TFunction) => void {
    return function(target: any) {
        target[InjectableDecoratorSymbol] = true;
        if (identifier) {
            if (target[AutobindIdentifierSymbol] == null) target[AutobindIdentifierSymbol] = [];
            target[AutobindIdentifierSymbol].push(identifier);
        }
    }
}

/**
 * Marks the constructor argument as being injectable.
 * @param identifier The identifier of the binding to inject.
 * @param opts Additional injection options.
 */
export function Inject(identifier: Identifier, opts?: InjectionOptions) {
    return function(target: any, targetKey: string, index: number) {
        let dependencies = target[ConstructorInjectionDecoratorsSymbol] as InjectionData[];
        if (dependencies == null) {
            dependencies = [];
            target[ConstructorInjectionDecoratorsSymbol] = dependencies;
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
 * This decorator is not order sensitive.  It can come before or after @Inject().
 */
export function Optional() {
    return function(target: any, targetKey: string, index: number) {
        let dependencies = target[ConstructorInjectionDecoratorsSymbol] as InjectionData[];
        if (dependencies == null) {
            dependencies = [];
            target[ConstructorInjectionDecoratorsSymbol] = dependencies;
        }
        if (dependencies[index] == null) {
            // @Optional can be applied before @Inject.
            dependencies[index] = {} as any;
        }
        dependencies[index].optional = true;
    } 
}
