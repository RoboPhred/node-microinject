
import {
    SingletonSymbol,
    InScopeSymbol,
    AsScopeSymbol,
    AsScopeSelfIdentifedSymbol
} from "./symbols";

import {
    Scope
} from "./interfaces";

export function Singleton<TFunction extends Function>(): (target: TFunction) => void {
    return function(target: any) {
        target[InScopeSymbol] = SingletonSymbol;
    }
}

export function InScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void {
    return function(target: any) {
        target[InScopeSymbol] = scope;
    }
}

/**
 * Specify that this object creates a new named scope.
 * @param scope The optional scope identifier to identify the scope created by this object.  If unset, the object will be identified by the identifier of the object.
 */
export function AsScope<TFunction extends Function>(scope?: Scope): (target: TFunction) => void {
    return function(target: any) {
        target[AsScopeSymbol] = (scope !== undefined) ? scope : AsScopeSelfIdentifedSymbol;
    }
}