"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function Singleton() {
    return function (target) {
        target[symbols_1.SingletonSymbol] = true;
    };
}
exports.Singleton = Singleton;
