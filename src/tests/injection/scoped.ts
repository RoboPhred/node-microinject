import { expect } from "chai";

import {
  Identifier,
  Container,
  injectable,
  inject,
  asScope,
  inScope
} from "../..";

describe("Scoped", function() {
  interface InstanceIdProvider {
    getInstanceId(): number;
  }

  const TargetScope = Symbol("TargetScope");
  const ScopedService = Symbol("ScopedService") as Identifier<
    InstanceIdProvider
  >;

  interface ScopeConsumer {
    getScopedService(): InstanceIdProvider;
  }
  const ScopeConsumerA = Symbol("ScopeConsumerA") as Identifier<ScopeConsumer>;
  const ScopeConsumerB = Symbol("ScopeConsumerB") as Identifier<ScopeConsumer>;

  interface ScopeRoot extends InstanceIdProvider {
    readonly consumerA: ScopeConsumer;
    readonly consumerB: ScopeConsumer;
  }
  const ScopeRoot = Symbol("ScopeRoot") as Identifier<ScopeRoot>;

  describe("auto-bound", function() {
    let container: Container;
    let scopeRoots: ScopeRoot[];
    before(function() {
      @injectable(ScopeRoot)
      @asScope(TargetScope)
      class ScopeRootImpl implements InstanceIdProvider {
        private static nextInstanceId = 1;
        private _instanceId: number;

        constructor(
          @inject(ScopeConsumerA) public consumerA: ScopeConsumer,
          @inject(ScopeConsumerB) public consumerB: ScopeConsumer
        ) {
          this._instanceId = ScopeRootImpl.nextInstanceId++;
        }

        getInstanceId() {
          return this._instanceId;
        }
      }

      @injectable(ScopeConsumerA)
      class ScopeConsumerAImpl implements ScopeConsumer {
        constructor(
          @inject(ScopedService) private _scopedService: InstanceIdProvider
        ) {}

        getScopedService(): InstanceIdProvider {
          return this._scopedService;
        }
      }

      @injectable(ScopeConsumerB)
      class ScopeConsumerBImpl implements ScopeConsumer {
        constructor(
          @inject(ScopedService) private _scopedService: InstanceIdProvider
        ) {}

        getScopedService(): InstanceIdProvider {
          return this._scopedService;
        }
      }

      @injectable(ScopedService)
      @inScope(TargetScope)
      class ScopedServiceImpl implements InstanceIdProvider {
        private static nextInstanceId = 1;
        private _instanceId: number;

        constructor() {
          this._instanceId = ScopedServiceImpl.nextInstanceId++;
        }

        getInstanceId() {
          return this._instanceId;
        }
      }

      container = new Container();
      container.bind(ScopeRootImpl);
      container.bind(ScopeConsumerAImpl);
      container.bind(ScopeConsumerBImpl);
      container.bind(ScopedServiceImpl);

      scopeRoots = Array.from(new Array(3), () => container.get(ScopeRoot));
    });

    it("creates a new scope root on each request", function() {
      let firstRoot = scopeRoots[0];
      for (let i = 1; i < scopeRoots.length; i++) {
        const nextRoot = scopeRoots[i];
        expect(firstRoot).to.not.equal(nextRoot);
      }
    });

    it("returns the same scoped object when in the same scope", function() {
      for (let root of scopeRoots) {
        const firstScoped = root.consumerA.getScopedService();
        const secondScoped = root.consumerB.getScopedService();
        expect(firstScoped).to.equal(secondScoped);
      }
    });

    it("returns a different scoped object from each scope root", function() {
      const seen = new Set();
      for (let root of scopeRoots) {
        const scoped = root.consumerA.getScopedService();
        expect(seen.has(scoped)).to.be.false;
        seen.add(scoped);
      }
    });
  });
});
