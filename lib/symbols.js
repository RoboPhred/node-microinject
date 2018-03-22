"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSymbol(id) {
    return Symbol.for(`github:robophred/microinject::${id}`);
}
exports.InjectableSymbol = getSymbol("Injectable");
exports.AutobindIdentifierSymbol = getSymbol("AutobindIdentifier");
exports.SingletonSymbol = getSymbol("Singleton");
exports.ConstructorInjectionsSymbol = getSymbol("ConstructorInjections");
