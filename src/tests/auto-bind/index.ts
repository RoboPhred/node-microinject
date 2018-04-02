
import { basename } from "path";

import requireDir = require("require-dir");

describe("Auto-Bind", function () {
    requireDir(".", {
        filter: x => basename(x) !== "index.js"
    });
});