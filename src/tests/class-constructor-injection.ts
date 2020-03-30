import { expect } from "chai";

import {
  Identifier,
  Container,
  injectable,
  inject,
  optional,
  DependencyResolutionError,
  all
} from "..";

describe("Class Constructor Injection", function() {
  @injectable()
  class FirstArgImpl {}
  const FirstArg = Symbol("FirstArg");

  @injectable()
  class SecondArgImpl {}
  const SecondArg = Symbol("SecondArg");

  describe("default inject", function() {
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

    describe("with matching bindings", function() {
      let container: Container;

      before(function() {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);
        container.bind(SecondArg).to(SecondArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("receives the args in its constructor", function() {
        const target = createTarget();
        expect(target.firstArg).instanceof(FirstArgImpl);
        expect(target.secondArg).instanceof(SecondArgImpl);
      });
    });

    describe("without matching bindings", function() {
      let container: Container;

      before(function() {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("throws DependencyResolutionError", function() {
        expect(createTarget).throws(DependencyResolutionError, /SecondArg/);
      });
    });

    describe("with multiple matching bindings", function() {
      let container: Container;

      before(function() {
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

      it("throws DependencyResolutionError", function() {
        expect(createTarget).throws(DependencyResolutionError, /SecondArg/);
      });
    });
  });

  describe("multi inject", function() {
    const InjectedService = Symbol("InjectedService");

    @injectable(InjectedService)
    class TestInjectA {}
    @injectable(InjectedService)
    class TestInjectB {}

    @injectable()
    class TestTarget {
      constructor(
        @inject(InjectedService)
        @all()
        public injected: any[]
      ) {}
    }

    let instance: TestTarget;
    before(function() {
      const container = new Container();
      container.bind(TestInjectA);
      container.bind(TestInjectB);
      container.bind(TestTarget);

      instance = container.get(TestTarget);
    });

    it("receives all bindings for the injected service", function() {
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

  describe("optional singular inject", function() {
    interface Target {
      firstArg: any;
    }
    const Target = Symbol("Target") as Identifier<Target>;
    @injectable(Target)
    class TargetImpl implements Target {
      constructor(
        @inject(FirstArg)
        @optional()
        public firstArg: any
      ) {}
    }

    describe("with matching binding", function() {
      let container: Container;

      before(function() {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("receives the arg in its constructor", function() {
        const target = createTarget();
        expect(target.firstArg).instanceof(FirstArgImpl);
      });
    });

    describe("without matching bindings", function() {
      let container: Container;

      before(function() {
        container = new Container();

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("receives null in its constructor", function() {
        const target = createTarget();
        expect(target.firstArg).null;
      });
    });

    describe("with multiple matching bindings", function() {
      let container: Container;

      before(function() {
        container = new Container();
        container.bind(FirstArg).to(FirstArgImpl);
        container.bind(FirstArg).to(SecondArgImpl);

        // Could also sinon stub the ctor and run the decorators on it manually.
        container.bind(TargetImpl);
      });

      function createTarget(): Target {
        return container.get(Target);
      }

      it("throws DependencyResolutionError", function() {
        expect(createTarget).throws(DependencyResolutionError, /FirstArg/);
      });
    });
  });
});
