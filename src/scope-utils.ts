
import {
    SingletonSymbol,
    InScopeSymbol,
    AsScopeSymbol
} from "./symbols";

import {
    Scope
} from "./interfaces";


export function isSingleton(target: any): boolean {
    return target[SingletonSymbol] === true;
}

export function getInScope(target: any): Scope {
    return target[InScopeSymbol];
}

export function getAsScope(target: any): Scope {
    return target[AsScopeSymbol];
}