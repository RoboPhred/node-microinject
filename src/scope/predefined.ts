
import {
    Scope
} from "./interfaces";

import {
    SelfIdentifiedScopeSymbol,
    SingletonScopeSymbol
} from "./symbols";

export const SingletonScope = SingletonScopeSymbol as Scope;
export const SelfIdentifiedScope = SelfIdentifiedScopeSymbol as Scope;