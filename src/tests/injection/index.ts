import { basename } from "path";

import requireDir = require("require-dir");

describe("Injection", function() {
  requireDir(".", {
    filter: x => basename(x) !== "index.js"
  });
});
