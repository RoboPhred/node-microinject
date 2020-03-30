"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const requireDir = require("require-dir");
describe("Integration", function () {
    requireDir(".", {
        filter: x => path_1.basename(x) !== "index.js"
    });
});
//# sourceMappingURL=index.js.map