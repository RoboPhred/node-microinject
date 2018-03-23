"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function Singleton() {
    return function (target) {
        target[symbols_1.SingletonSymbol] = true;
    };
}
exports.Singleton = Singleton;
// TODO: Implement the functionality of these.
// export function InScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void {
//     return function(target: any) {
//         target[InScopeSymbol] = scope;
//     }
// }
// export function AsScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void {
//     return function(target: any) {
//         target[AsScopeSymbol] = scope;
//     }
// }
//# sourceMappingURL=scopes.js.map