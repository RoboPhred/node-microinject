import { basename } from "path";

import requireDir = require("require-dir");

describe("Factory Binding", function() {
  requireDir(".", {
    filter: x => basename(x) !== "index.js"
  });
});
