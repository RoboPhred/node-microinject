import { expect } from "chai";

import { injectable, inject } from "../injection";
import { Container } from "../container";

describe("parent injection", function() {
  const Target = Symbol("Target");
  const TargetValue = 42;
  describe("direct request", function() {
    it("returns the requested value", function() {
      const parentContainer = new Container();
      parentContainer.bind(Target).toConstantValue(TargetValue);
      const childContainer = new Container();
      childContainer.parent = parentContainer;

      const resolved = childContainer.get(Target);
      expect(resolved).equals(TargetValue);
    });
  });

  describe("indirect request", function() {
    @injectable()
    class TargetProvider {
      constructor(@inject(Target) public target: number) {}
    }

    it("injects the requested value", function() {
      const parentContainer = new Container();
      parentContainer.bind(Target).toConstantValue(TargetValue);

      const childContainer = new Container();
      childContainer.parent = parentContainer;
      childContainer.bind(TargetProvider).toSelf();

      const resolved = childContainer.get(TargetProvider);
      expect(resolved.target).equals(TargetValue);
    });
  });
});
