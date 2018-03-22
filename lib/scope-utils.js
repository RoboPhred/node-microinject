"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symbols_1 = require("./symbols");
function isSingleton(target) {
    return target[symbols_1.SingletonSymbol] === true;
}
exports.isSingleton = isSingleton;
