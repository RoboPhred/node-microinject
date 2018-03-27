import { Identifier } from "./interfaces";
export declare function isAutoBindFactory(target: any): boolean;
/**
 * Returns the autobind identifiers of the target.  Returns an empty array if none were specified.
 * @param target The target to test for injectability.
 */
export declare function getProvidedIdentifiers(target: any): Identifier[];
