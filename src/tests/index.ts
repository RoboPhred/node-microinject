import { basename } from "path";

import requireDir = require("require-dir");

describe("Integration", function() {
  requireDir(".", {
    filter: x => basename(x) !== "index.js"
  });
});
