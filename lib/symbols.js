"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSymbol(id) {
    // Get the symbol using Symbol.for (to avoid problems with multiple library copies in node_module),
    //  and scope it with a prefix (to avoid name collisions).
    return Symbol.for(`github:robophred/microinject::${id}`);
}
exports.InjectableSymbol = getSymbol("Injectable");
exports.AutobindIdentifierSymbol = getSymbol("AutobindIdentifier");
exports.SingletonSymbol = getSymbol("Singleton");
exports.ConstructorInjectionsSymbol = getSymbol("ConstructorInjections");
exports.InScopeSymbol = getSymbol("InScope");
exports.AsScopeSymbol = getSymbol("AsScope");
//# sourceMappingURL=symbols.js.map