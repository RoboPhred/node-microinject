import { expect } from "chai";

import {
  Container,
  DependencyResolutionError,
  inject,
  injectable,
  singleton,
} from "..";

describe("Class Property Injection", function () {
  const InjectedValue = Symbol("InjectedValue");
  const preValue = Symbol("pre-inject-value");

  describe("default", function () {
    const testValue = Symbol("test-value");

    @injectable()
    class TestTarget {
      @inject(InjectedValue)
      injectedValueProp: any = preValue;
    }

    describe("when injected identifier is bound", function () {
      it("injects the value into the property", function () {
        const container = new Container();
        container.bind(InjectedValue).toConstantValue(testValue);
        container.bind(TestTarget).to(TestTarget);
        const instance = container.get(TestTarget);

        expect(instance.injectedValueProp).to.equal(testValue);
      });
    });

    describe("when injected identifier is not bound", function () {
      it("throws an error if the value is not found", function () {
        const container = new Container();
        container.bind(TestTarget).to(TestTarget);

        expect(() => container.get(TestTarget)).to.throw(
          DependencyResolutionError,
          /InjectedValue/
        );
      });
    });
  });

  describe("circular through constructor", function () {
    @injectable()
    @singleton()
    class TestTarget {
      @inject(InjectedValue)
      injectedValueProp: TestInjected | null = null;
    }

    @injectable(InjectedValue)
    class TestInjected {
      constructor(@inject(TestTarget) public injected: TestTarget) {}
    }

    describe("when injected identifier is bound", function () {
      let instance: TestTarget;
      before(function () {
        const container = new Container();
        container.bind(InjectedValue).to(TestInjected);
        container.bind(TestTarget).to(TestTarget);
        instance = container.get(TestTarget);
      });

      it("injects the value into the property", function () {
        expect(instance.injectedValueProp).to.be.instanceof(TestInjected);
      });

      it("uses the singleton instance", function () {
        expect(instance.injectedValueProp!.injected).to.equal(instance);
      });
    });
  });

  describe("circular through properties", function () {
    @injectable()
    @singleton()
    class TestTarget {
      @inject(InjectedValue)
      injectedValueProp: TestInjected | null = null;
    }

    @injectable(InjectedValue)
    class TestInjected {
      @inject(TestTarget) public injected!: TestTarget;
    }

    describe("when injected identifier is bound", function () {
      let instance: TestTarget;
      before(function () {
        const container = new Container();
        container.bind(InjectedValue).to(TestInjected);
        container.bind(TestTarget).to(TestTarget);
        instance = container.get(TestTarget);
      });

      it("injects the value into the property", function () {
        expect(instance.injectedValueProp).to.be.instanceof(TestInjected);
      });

      it("uses the singleton instance", function () {
        expect(instance.injectedValueProp!.injected).to.equal(instance);
      });
    });
  });

  describe("optional", function () {
    const testValue = Symbol("test-value");

    @injectable()
    class TestTarget {
      @inject(InjectedValue, { optional: true })
      injectedValueProp: any = preValue;
    }

    describe("when injected identifier is bound", function () {
      it("injects the value into the property when available", function () {
        const container = new Container();
        container.bind(InjectedValue).toConstantValue(testValue);
        container.bind(TestTarget).to(TestTarget);
        const instance = container.get(TestTarget);
        expect(instance.injectedValueProp).to.equal(testValue);
      });
    });

    describe("when injected identifier is not bound", function () {
      it("sets the property to null", function () {
        const container = new Container();
        container.bind(TestTarget).to(TestTarget);
        const instance = container.get(TestTarget);
        expect(instance.injectedValueProp).to.be.null;
      });
    });
  });

  describe("all", function () {
    const firstValue = "foo";
    const secondValue = "bar";

    @injectable()
    class TestTarget {
      @inject(InjectedValue, { all: true })
      public allInjections: string[] | undefined;
    }

    let container: Container;
    before(function () {
      container = new Container();
      container.bind(InjectedValue).toConstantValue(firstValue);
      container.bind(InjectedValue).toConstantValue(secondValue);
      container.bind(TestTarget).to(TestTarget);
    });

    it("receives all values", function () {
      const instance = container.get(TestTarget);
      const injected = instance.allInjections!;
      expect(injected.length).equals(2);
      expect(injected).to.contain(firstValue);
      expect(injected).to.contain(secondValue);
    });
  });
});
