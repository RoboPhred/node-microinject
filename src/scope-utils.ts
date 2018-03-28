
import {
    SingletonSymbol,
    InScopeSymbol,
    AsScopeSymbol
} from "./symbols";

import {
    Scope
} from "./interfaces";


export function getInScope(target: any): Scope {
    return target[InScopeSymbol];
}

export function getAsScope(target: any): Scope {
    return target[AsScopeSymbol];
}