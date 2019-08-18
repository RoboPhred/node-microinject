import { getSymbol as getParentSymbol } from "../symbols";

function getSymbol(id: string) {
  return getParentSymbol(`/binder/${id}`);
}

/**
 * Metadata identifier for an array of identifiers that this
 * object should be bound as.
 */
export const AutobindIdentifiersKey = getSymbol("AutobindIdentifiers");
