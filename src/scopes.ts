
import {
    SingletonSymbol,
    InScopeSymbol,
    AsScopeSymbol
} from "./symbols";

import {
    Scope
} from "./interfaces";

export function Singleton<TFunction extends Function>(): (target: TFunction) => void {
    return function(target: any) {
        target[SingletonSymbol] = true;
    }
}

export function InScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void {
    return function(target: any) {
        target[InScopeSymbol] = scope;
    }
}

export function AsScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void {
    return function(target: any) {
        target[AsScopeSymbol] = scope;
    }
}