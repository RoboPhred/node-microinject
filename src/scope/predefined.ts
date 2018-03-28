
import {
    Scope
} from "./interfaces";

import {
    SingletonScopeSymbol,
    SelfIdentifiedScopeSymbol
} from "./symbols"

export const SingletonScope = SingletonScopeSymbol as Scope;
export const SelfIdentifiedScope = SelfIdentifiedScopeSymbol as Scope;