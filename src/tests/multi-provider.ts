import { expect, use as chaiUse } from "chai";
import { spy, SinonSpy } from "sinon";
import sinonChai = require("sinon-chai");
chaiUse(sinonChai);

import { Identifier, injectable, provides, singleton, Container } from "..";

describe("multi-provider", function() {
  interface LeftTarget {
    getLeft(): number;
  }
  interface RightTarget {
    getRight(): number;
  }
  const Left = Symbol("left") as Identifier<LeftTarget>;
  const Right = Symbol("right") as Identifier<RightTarget>;

  describe("singleton", function() {
    describe("factory", function() {
      const instance: LeftTarget & RightTarget = {
        getLeft: () => 1,
        getRight: () => 2
      };
      let factory: SinonSpy<[], LeftTarget & RightTarget>;

      let left: LeftTarget;
      let right: RightTarget;
      before(() => {
        factory = spy(() => instance);
        const container = new Container();
        container
          .bind(Left)
          .provides(Right)
          .toFactory(factory)
          .inSingletonScope();
        left = container.get(Left);
        right = container.get(Right);
      });

      it("invokes the factory once", () => {
        expect(factory).callCount(1);
      });

      it("uses the same singleton for both services", () => {
        expect(left).equals(right);
      });
    });

    describe("auto-bound", function() {
      @injectable()
      @provides(Left)
      @provides(Right)
      @singleton()
      class LeftRightImpl implements LeftTarget, RightTarget {
        private static serviceInstanceCounter = 1;
        private _instanceId: number;

        constructor() {
          this._instanceId = LeftRightImpl.serviceInstanceCounter++;
        }

        getLeft(): number {
          return -5;
        }
        getRight(): number {
          return 5;
        }

        toString() {
          return String(this._instanceId);
        }
      }

      let left: LeftTarget;
      let right: RightTarget;
      before(function() {
        const container = new Container();
        container.bind(LeftRightImpl);
        left = container.get(Left);
        right = container.get(Right);
      });

      it("uses the same singleton for both services", function() {
        expect(left).equals(right);
      });
    });
  });
});
