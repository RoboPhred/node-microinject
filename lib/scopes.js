"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function singleton() {
    return function (target) {
        target[symbols_1.SingletonSymbol] = true;
    };
}
exports.singleton = singleton;
