import { expect } from "chai";

import {
  Identifier,
  Container,
  injectable,
  inject,
  DependencyResolutionError,
} from "..";
import { getConstructorInjections } from "../injection/utils";

describe("Class Constructor Injection", function () {
  @injectable()
  class FirstArgImpl {}
  const FirstArg = Symbol("FirstArg");

  @injectable()
  class SecondArgImpl {}
  const SecondArg = Symbol("SecondArg");

  describe("default inject", function () {
    interface Target {
      firstArg: any;
      secondArg: any;
    }
    const Target = Symbol("Target") as Identifier<Target>;
    @injectable(Target)
    class TargetImpl implements Target {
      constructor(
        @inject(FirstArg) public firstArg: any,
        @inject(SecondArg) public secondArg: any
      ) {}
    }

    describe("with matching bindings", function () {
      let container: Container;

      before(function () {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);
        container.bind(SecondArg).to(SecondArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("receives the args in its constructor", function () {
        const target = createTarget();
        expect(target.firstArg).instanceof(FirstArgImpl);
        expect(target.secondArg).instanceof(SecondArgImpl);
      });
    });

    describe("without matching bindings", function () {
      let container: Container;

      before(function () {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("throws DependencyResolutionError", function () {
        expect(createTarget).throws(DependencyResolutionError, /SecondArg/);
      });
    });

    describe("with multiple matching bindings", function () {
      let container: Container;

      before(function () {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);

        container.bind(SecondArg).to(FirstArgImpl);
        container.bind(SecondArg).to(SecondArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("throws DependencyResolutionError", function () {
        expect(createTarget).throws(DependencyResolutionError, /SecondArg/);
      });
    });
  });

  describe("multi inject", function () {
    const InjectedService = Symbol("InjectedService");

    @injectable(InjectedService)
    class TestInjectA {}
    @injectable(InjectedService)
    class TestInjectB {}

    @injectable()
    class TestTarget {
      constructor(
        @inject(InjectedService, { all: true })
        public injected: any[]
      ) {}
    }

    let instance: TestTarget;
    before(function () {
      const container = new Container();
      container.bind(TestInjectA);
      container.bind(TestInjectB);
      container.bind(TestTarget);

      instance = container.get(TestTarget);
    });

    it("receives all bindings for the injected service", function () {
      expect(instance.injected.length).equals(2);

      // Want a more elegant way to test this...
      const first = instance.injected[0];
      const hasA = first instanceof TestInjectA || first instanceof TestInjectB;
      expect(hasA).to.be.true;

      const second = instance.injected[1];
      const hasB =
        second instanceof TestInjectA || second instanceof TestInjectB;
      expect(hasB).to.be.true;
    });
  });

  describe("optional singular inject", function () {
    interface Target {
      firstArg: any;
    }
    const Target = Symbol("Target") as Identifier<Target>;
    @injectable(Target)
    class TargetImpl implements Target {
      constructor(
        @inject(FirstArg, { optional: true })
        public firstArg: any
      ) {}
    }

    describe("with matching binding", function () {
      let container: Container;

      before(function () {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("receives the arg in its constructor", function () {
        const target = createTarget();
        expect(target.firstArg).instanceof(FirstArgImpl);
      });
    });

    describe("without matching bindings", function () {
      let container: Container;

      before(function () {
        container = new Container();

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("receives undefined in its constructor", function () {
        const target = createTarget();
        expect(target.firstArg).is.undefined;
      });
    });

    describe("with multiple matching bindings", function () {
      let container: Container;

      before(function () {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);
        container.bind(FirstArg).to(SecondArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("throws DependencyResolutionError", function () {
        expect(createTarget).throws(DependencyResolutionError, /FirstArg/);
      });
    });
  });

  it("does not pollute base classes", () => {
    const Injectable1 = "s1";
    const Injectable2 = "s2";
    const InjectableB = "sb";
    class Base {
      constructor(@inject(InjectableB) public sb: string) {}
    }

    class C1 extends Base {
      constructor(
        @inject(InjectableB) sb: string,
        @inject(Injectable1) public s1: string
      ) {
        super(sb);
      }
    }

    class C2 extends Base {
      constructor(
        @inject(InjectableB) sb: string,
        @inject(Injectable2) public s2: string
      ) {
        super(sb);
      }
    }

    const bCtorData = getConstructorInjections(Base);

    expect(bCtorData.length).to.equal(1);

    const container = new Container();
    container.bind(InjectableB).toConstantValue(InjectableB);
    container.bind(Injectable1).toConstantValue(Injectable1);
    container.bind(Injectable2).toConstantValue(Injectable2);

    const c1 = container.create(C1);
    expect(c1.s1).to.equal(Injectable1);

    const c2 = container.create(C2);
    expect(c2.s2).to.equal(Injectable2);
  });
});
