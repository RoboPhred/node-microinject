
export function getSymbol(id: string): symbol {
    // Get the symbol using Symbol.for (to avoid problems with multiple library copies in node_module),
    //  and scope it with a prefix (to avoid name collisions).
    return Symbol.for(`github:robophred/microinject::${id}`);
}

export const InjectableSymbol = getSymbol("Injectable");
export const IsAutoBindFactorySymbol = getSymbol("IsAutoBindFactorySymbol");
export const AutobindIdentifierSymbol = getSymbol("AutobindIdentifier");
export const ConstructorInjectionsSymbol = getSymbol("ConstructorInjections");
