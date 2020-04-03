import { use as chaiUse, expect } from "chai";

import sinonChai = require("sinon-chai");
chaiUse(sinonChai);

import { SinonStub, stub, spy, match, SinonStubbedInstance } from "sinon";

import { Identifier, Newable } from "../interfaces";

import { DependencyResolutionError } from "../errors";

import {
  DependencyNode,
  ConstDependencyNode,
  FactoryDependencyNode,
  ConstructorDependencyNode,
  isBindingDependencyNode
} from "../planner";

import { DependencyGraphResolver } from "./interfaces";

import { defaultComponentResolvers } from "./component-resolver";

type StubDependencyGraphResolver = SinonStubbedInstance<
  DependencyGraphResolver
>;

describe("defaultComponentResolvers", function() {
  const stubResolver: StubDependencyGraphResolver = {
    isInstantiating: stub(),
    getResolveStack: stub(),
    resolveInstance: stub()
  };

  beforeEach(function() {
    values(stubResolver).forEach(x => x.reset());
  });

  describe(".factory", function() {
    const identifier: Identifier = Symbol("factory-identifier");
    const factoryReturnValue = Symbol("factory-return-value");
    const factoryStub = stub().returns(factoryReturnValue);
    const factoryNode: FactoryDependencyNode = {
      type: "factory",
      identifiers: [identifier],
      identifier,
      bindingId: "factory-binding-id",
      nodeId: "factory-component-id",
      factory: factoryStub,
      planner: {} as any
    };

    let resolvedValue: any;
    before(function() {
      resolvedValue = defaultComponentResolvers.factory(
        factoryNode,
        stubResolver as DependencyGraphResolver,
        {}
      );
    });

    it("invokes the factory", function() {
      expect(factoryStub).calledOnce;
    });

    it("returns the factory result", function() {
      expect(resolvedValue).equals(factoryReturnValue);
    });
  });

  describe(".ctor", function() {
    // constructors are just functions, so we can use a stub for them.
    const constructorStub: SinonStub & Newable = stub() as any;
    const identifier: Identifier = Symbol("ctor-identifier");

    const partialCtorCreator = {
      type: "constructor" as const,
      identifiers: [identifier],
      identifier,
      bindingId: "ctor-binding-id",
      nodeId: "ctor-node-id",
      ctor: constructorStub
    };

    function invokeResolver(args: DependencyNode[]) {
      const creator: ConstructorDependencyNode = {
        ...partialCtorCreator,
        ctorInjections: args.map(arg => {
          if (isBindingDependencyNode(arg)) {
            return {
              type: "identifier",
              identifier: arg.identifier
            };
          } else {
            return {
              type: "parameter",
              optional: arg.optional,
              paramKey: arg.paramKey
            };
          }
        }),
        propInjections: new Map(),
        ctorInjectionNodes: args,
        propInjectionNodes: new Map()
      };
      return defaultComponentResolvers.ctor(
        creator,
        stubResolver as DependencyGraphResolver,
        {}
      );
    }

    beforeEach(function() {
      constructorStub.reset();
    });

    it("invokes the constructor", function() {
      invokeResolver([]);
      expect(constructorStub).calledOnce;
      expect(constructorStub).calledWithNew;
    });

    it("resolves arguments", function() {
      const firstArg: ConstDependencyNode = {
        type: "value",
        identifiers: ["first-arg-identifier"],
        identifier: "first-arg-identifier",
        bindingId: "first-arg-binding-id",
        nodeId: "first-arg-instance",
        value: "first-arg-value"
      };
      const secondArg: ConstDependencyNode = {
        type: "value",
        identifiers: ["second-arg-identifier"],
        identifier: "second-arg-identifier",
        bindingId: "second-arg-binding-id",
        nodeId: "second-arg-instance",
        value: "second-arg-value"
      };

      invokeResolver([firstArg, secondArg]);

      expect(stubResolver.resolveInstance).calledTwice;
      expect(stubResolver.resolveInstance.firstCall).calledWith(firstArg);
      expect(stubResolver.resolveInstance.secondCall).calledWith(secondArg);
    });

    it("passes the resolved arguments to the constructor", function() {
      const firstArgValue = "first-arg-value";
      const firstArg: DependencyNode = {
        type: "value",
        identifiers: ["first-arg-identifier"],
        identifier: "first-arg-identifier",
        bindingId: "first-arg-binding-id",
        nodeId: "first-arg-instance",
        value: firstArgValue
      };

      const secondArgValue = "second-arg-value";
      const secondArg: DependencyNode = {
        type: "value",
        identifiers: ["second-arg-identifier"],
        identifier: "second-arg-identifier",
        bindingId: "second-arg-binding-id",
        nodeId: "second-arg-instance",
        value: secondArgValue
      };

      stubResolver.resolveInstance.withArgs(firstArg).returns(firstArgValue);
      stubResolver.resolveInstance.withArgs(secondArg).returns(secondArgValue);

      invokeResolver([firstArg, secondArg]);

      expect(constructorStub).calledWith(firstArgValue, secondArgValue);
    });

    it("throws on circular dependencies", function() {
      const IdentifierA = Symbol("class-a");
      const classA: ConstructorDependencyNode = {
        type: "constructor",
        identifiers: [IdentifierA],
        identifier: IdentifierA,
        bindingId: "class-a-binding",
        nodeId: "class-a-instance",
        ctor: stub() as any,
        ctorInjections: [],
        propInjections: new Map(),
        ctorInjectionNodes: [],
        propInjectionNodes: new Map()
      };
      const IdentifierB = Symbol("class-b");
      const classB: ConstructorDependencyNode = {
        type: "constructor",
        identifiers: [IdentifierB],
        identifier: IdentifierB,
        bindingId: "class-b-binding",
        nodeId: "class-b-instance",
        ctor: stub() as any,
        ctorInjections: [
          {
            type: "identifier",
            identifier: classA.identifier
          }
        ],
        propInjections: new Map(),
        ctorInjectionNodes: [{ ...classA }],
        propInjectionNodes: new Map()
      };
      classA.ctorInjections.push({
        type: "identifier",
        identifier: classB.identifier
      });
      classA.ctorInjectionNodes.push({ ...classB });

      // Simulate resolving class B, when requested by class A.
      //  class B will then request class A, and we expect this to error.
      stubResolver.isInstantiating.withArgs(classA).returns(true);
      stubResolver.isInstantiating.withArgs(classB).returns(true);
      stubResolver.getResolveStack.returns([classA, classB]);

      expect(() =>
        defaultComponentResolvers.ctor(
          classB,
          stubResolver as DependencyGraphResolver,
          {}
        )
      ).to.throw(DependencyResolutionError, /cyclic/);
    });
  });

  describe(".value", function() {
    const identifier: Identifier = Symbol("value-identifier");
    const returnValue = Symbol("return-value");
    const valueNode: ConstDependencyNode = {
      type: "value",
      identifiers: [identifier],
      identifier,
      bindingId: "value-binding-id",
      nodeId: "value-instance-id",
      value: returnValue
    };

    let resolvedValue: any;
    before(function() {
      resolvedValue = defaultComponentResolvers.const(
        valueNode,
        stubResolver as DependencyGraphResolver,
        {}
      );
    });

    it("returns the value result", function() {
      expect(resolvedValue).equals(returnValue);
    });
  });
});

function values<T, K extends keyof T>(obj: T): (T[K])[] {
  // Typescript does not type Object.keys as T[K] on its own,
  //  probably because it can't be sure of it at runtime.
  const keys = Object.keys(obj) as K[];
  return keys.map(x => obj[x]);
}
