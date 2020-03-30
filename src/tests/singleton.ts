import { expect } from "chai";

import { Container, Identifier, injectable, singleton } from "..";

describe("Singleton", function() {
  interface TestSingleton {
    getInstanceId(): number;
  }
  const TestSingleton = Symbol("TestSingleton") as Identifier<TestSingleton>;

  describe("auto-bound", function() {
    let container: Container;
    before(function() {
      @injectable(TestSingleton)
      @singleton()
      class TestSingletonImpl implements TestSingleton {
        private static nextInstanceId = 1;
        private _instanceId: number;

        constructor() {
          this._instanceId = TestSingletonImpl.nextInstanceId++;
        }

        getInstanceId() {
          return this._instanceId;
        }
      }

      container = new Container();
      container.bind(TestSingletonImpl);
    });

    it("generates a single instance for all requests", function() {
      const instance = container.get(TestSingleton);
      const requestCount = 3;
      const otherRequests = Array.from(new Array(requestCount), () =>
        container.get(TestSingleton)
      );

      for (let other of otherRequests) {
        expect(other).to.equal(instance);
      }
    });
  });
});
