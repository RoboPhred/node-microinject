import { Identifier } from "../interfaces";

import { AutobindIdentifiersKey } from "./symbols";

/**
 * Specify that the given constructor or function provides the given identifier.
 * This is used when auto-binding is invoked by passing the object directly as the identifier.
 * This decorator can be used more than once to mark the object as providing multiple services.
 * @param identifier The identifier to automatically bind this class to when bound without additional configuration.
 */
export function provides<TFunction extends Function>(
  identifier: Identifier
): (target: TFunction) => void {
  return function(target: any) {
    if (target[AutobindIdentifiersKey] == null) {
      target[AutobindIdentifiersKey] = [];
    }
    target[AutobindIdentifiersKey].push(identifier);
  };
}
