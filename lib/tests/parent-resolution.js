"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const container_1 = require("../container");
describe("parent resolution", function () {
    const parentContainer = new container_1.Container();
    const childContainer = new container_1.Container();
    childContainer.parent = parentContainer;
    const Identifier = "identifier";
    const value = "identifier value";
    parentContainer.bind(Identifier).toConstantValue(value);
    it("resolves values from the parent", function () {
        const value = childContainer.get(Identifier);
        chai_1.expect(value).equals(value);
    });
    it("resolves one value", function () {
        const values = childContainer.getAll(Identifier);
        chai_1.expect(values).length(1);
    });
});
//# sourceMappingURL=parent-resolution.js.map