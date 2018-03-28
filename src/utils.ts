
import {
    Identifier
} from "./interfaces";

import {
    Scope
} from "./scope";


export function identifierToString(identifier: Identifier) {
    return String(identifier);
}

export function scopeToString(scope: Scope) {
    return String(scope);
}
