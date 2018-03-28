
import {
    Identifier
} from "../interfaces";

import {
    IsAutoBindFactorySymbol,
    AutobindIdentifierSymbol
} from "../symbols";


export function isAutoBindFactory(target: any): boolean {
    return target[IsAutoBindFactorySymbol] || false;
}
/**
 * Returns the autobind identifiers of the target.  Returns an empty array if none were specified.
 * @param target The target to test for injectability.
 */
export function getProvidedIdentifiers(target: any): Identifier[] {
    return target[AutobindIdentifierSymbol] || [];
}