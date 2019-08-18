import { Identifier } from "../interfaces";

import { AutobindIdentifiersKey } from "./symbols";

/**
 * Returns the autobind identifiers of the target.  Returns an empty array if none were specified.
 * @param target The target to test for injectability.
 */
export function getProvidedIdentifiers(target: any): Identifier[] {
  return target[AutobindIdentifiersKey] || [];
}
