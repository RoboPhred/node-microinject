"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSymbol(id) {
    // Get the symbol using Symbol.for (to avoid problems with multiple library copies in node_module),
    //  and scope it with a prefix (to avoid name collisions).
    return Symbol.for(`github:robophred/node-microinject::${id}`);
}
exports.getSymbol = getSymbol;
//# sourceMappingURL=symbols.js.map