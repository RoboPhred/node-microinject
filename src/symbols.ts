
export function getSymbol(id: string): symbol {
    // Get the symbol using Symbol.for (to avoid problems with multiple library copies in node_module),
    //  and scope it with a prefix (to avoid name collisions).
    return Symbol.for(`github:robophred/node-microinject::${id}`);
}
