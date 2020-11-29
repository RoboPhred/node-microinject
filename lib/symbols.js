"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSymbol = void 0;
/**
 * Gets a symbol unique to all instances of this library with the given id.
 * The returned symbol may be retrieved from a symbol cache, enabling
 * multiple copies of the library to interop.
 * @param id The ID of the symbol to get.
 */
function getSymbol(id) {
    // Get the symbol using Symbol.for (to avoid problems with multiple library copies in node_module),
    //  and scope it with a prefix (to avoid name collisions).
    return Symbol.for(`github:robophred/node-microinject::${id}`);
}
exports.getSymbol = getSymbol;
//# sourceMappingURL=symbols.js.map