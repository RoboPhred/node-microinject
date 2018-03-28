

import {
    getSymbol as getParentSymbol
} from "../symbols";

function getSymbol(id: string) {
    return getParentSymbol(`/binder/${id}`);
}

export const AutobindAsFactoryKey = getSymbol("IsAutoBindFactory");
export const AutobindIdentifiersKey = getSymbol("AutobindIdentifier");