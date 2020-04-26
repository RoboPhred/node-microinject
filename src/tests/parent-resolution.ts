import { expect } from "chai";

import { Container } from "../container";

describe("parent resolution", function() {
  const parentContainer = new Container();
  const childContainer = new Container();
  childContainer.parent = parentContainer;

  const Identifier = "identifier";
  const value = "identifier value";
  parentContainer.bind(Identifier).toConstantValue(value);

  it("resolves values from the parent", function() {
    const value = childContainer.get(Identifier);
    expect(value).equals(value);
  });

  it("resolves one value", function() {
    const values = childContainer.getAll(Identifier);
    expect(values).length(1);
  });
});
