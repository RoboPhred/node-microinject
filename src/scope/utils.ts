
import {
    InScopeDecoratorSymbol,
    AsScopeDecoratorSymbol
} from "./symbols";

import {
    Scope
} from "./interfaces";


export function getInScope(target: any): Scope {
    return target[InScopeDecoratorSymbol];
}

export function getAsScope(target: any): Scope {
    return target[AsScopeDecoratorSymbol];
}