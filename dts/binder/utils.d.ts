import { Identifier } from "../interfaces";
/**
 * Returns the autobind identifiers of the target.  Returns an empty array if none were specified.
 * @param target The target to test for injectability.
 */
export declare function getProvidedIdentifiers(target: any): Identifier[];
