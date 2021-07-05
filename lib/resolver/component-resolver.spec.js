"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinonChai = require("sinon-chai");
chai_1.use(sinonChai);
const sinon_1 = require("sinon");
const errors_1 = require("../errors");
const component_resolver_1 = require("./component-resolver");
describe("defaultComponentResolvers", function () {
    const stubResolver = {
        isInstantiating: sinon_1.stub(),
        getResolveStack: sinon_1.stub(),
        resolveInstance: sinon_1.stub(),
        getScopeRoot: sinon_1.stub(),
    };
    beforeEach(function () {
        values(stubResolver).forEach((x) => x.reset());
    });
    describe(".factory", function () {
        const identifier = Symbol("factory-identifier");
        const factoryReturnValue = Symbol("factory-return-value");
        const factoryStub = sinon_1.stub().returns(factoryReturnValue);
        const factoryNode = {
            type: "factory",
            identifiers: [identifier],
            identifier,
            bindingId: "factory-binding-id",
            nodeId: "factory-component-id",
            factory: factoryStub,
            planner: {},
        };
        let resolvedValue;
        before(function () {
            resolvedValue = component_resolver_1.defaultComponentResolvers.factory(factoryNode, stubResolver, {});
        });
        it("invokes the factory", function () {
            chai_1.expect(factoryStub).calledOnce;
        });
        it("returns the factory result", function () {
            chai_1.expect(resolvedValue).equals(factoryReturnValue);
        });
    });
    describe(".ctor", function () {
        // constructors are just functions, so we can use a stub for them.
        const constructorStub = sinon_1.stub();
        const identifier = Symbol("ctor-identifier");
        const partialCtorCreator = {
            type: "constructor",
            identifiers: [identifier],
            identifier,
            bindingId: "ctor-binding-id",
            nodeId: "ctor-node-id",
            ctor: constructorStub,
        };
        function invokeResolver(args) {
            const creator = Object.assign(Object.assign({}, partialCtorCreator), { ctorInjections: args.map((arg) => {
                    return {
                        type: "identifier",
                        identifier: arg.identifier,
                    };
                }), propInjections: new Map(), ctorInjectionNodes: args, propInjectionNodes: new Map() });
            return component_resolver_1.defaultComponentResolvers.ctor(creator, stubResolver, {});
        }
        beforeEach(function () {
            constructorStub.reset();
        });
        it("invokes the constructor", function () {
            invokeResolver([]);
            chai_1.expect(constructorStub).calledOnce;
            chai_1.expect(constructorStub).calledWithNew;
        });
        it("resolves arguments", function () {
            const firstArg = {
                type: "value",
                identifiers: ["first-arg-identifier"],
                identifier: "first-arg-identifier",
                bindingId: "first-arg-binding-id",
                nodeId: "first-arg-instance",
                value: "first-arg-value",
            };
            const secondArg = {
                type: "value",
                identifiers: ["second-arg-identifier"],
                identifier: "second-arg-identifier",
                bindingId: "second-arg-binding-id",
                nodeId: "second-arg-instance",
                value: "second-arg-value",
            };
            invokeResolver([firstArg, secondArg]);
            chai_1.expect(stubResolver.resolveInstance).calledTwice;
            chai_1.expect(stubResolver.resolveInstance.firstCall).calledWith(firstArg);
            chai_1.expect(stubResolver.resolveInstance.secondCall).calledWith(secondArg);
        });
        it("passes the resolved arguments to the constructor", function () {
            const firstArgValue = "first-arg-value";
            const firstArg = {
                type: "value",
                identifiers: ["first-arg-identifier"],
                identifier: "first-arg-identifier",
                bindingId: "first-arg-binding-id",
                nodeId: "first-arg-instance",
                value: firstArgValue,
            };
            const secondArgValue = "second-arg-value";
            const secondArg = {
                type: "value",
                identifiers: ["second-arg-identifier"],
                identifier: "second-arg-identifier",
                bindingId: "second-arg-binding-id",
                nodeId: "second-arg-instance",
                value: secondArgValue,
            };
            stubResolver.resolveInstance.withArgs(firstArg).returns(firstArgValue);
            stubResolver.resolveInstance.withArgs(secondArg).returns(secondArgValue);
            invokeResolver([firstArg, secondArg]);
            chai_1.expect(constructorStub).calledWith(firstArgValue, secondArgValue);
        });
        it("throws on circular dependencies", function () {
            const IdentifierA = Symbol("class-a");
            const classA = {
                type: "constructor",
                identifiers: [IdentifierA],
                identifier: IdentifierA,
                bindingId: "class-a-binding",
                nodeId: "class-a-instance",
                ctor: sinon_1.stub(),
                ctorInjections: [],
                propInjections: new Map(),
                ctorInjectionNodes: [],
                propInjectionNodes: new Map(),
            };
            const IdentifierB = Symbol("class-b");
            const classB = {
                type: "constructor",
                identifiers: [IdentifierB],
                identifier: IdentifierB,
                bindingId: "class-b-binding",
                nodeId: "class-b-instance",
                ctor: sinon_1.stub(),
                ctorInjections: [
                    {
                        type: "identifier",
                        identifier: classA.identifier,
                    },
                ],
                propInjections: new Map(),
                ctorInjectionNodes: [Object.assign({}, classA)],
                propInjectionNodes: new Map(),
            };
            classA.ctorInjections.push({
                type: "identifier",
                identifier: classB.identifier,
            });
            classA.ctorInjectionNodes.push(Object.assign({}, classB));
            // Simulate resolving class B, when requested by class A.
            //  class B will then request class A, and we expect this to error.
            stubResolver.isInstantiating.withArgs(classA).returns(true);
            stubResolver.isInstantiating.withArgs(classB).returns(true);
            stubResolver.getResolveStack.returns([classA, classB]);
            chai_1.expect(() => component_resolver_1.defaultComponentResolvers.ctor(classB, stubResolver, {})).to.throw(errors_1.DependencyResolutionError, /cyclic/);
        });
    });
    describe(".const", function () {
        const identifier = Symbol("value-identifier");
        const returnValue = Symbol("return-value");
        const valueNode = {
            type: "value",
            identifiers: [identifier],
            identifier,
            bindingId: "value-binding-id",
            nodeId: "value-instance-id",
            value: returnValue,
        };
        let resolvedValue;
        before(function () {
            resolvedValue = component_resolver_1.defaultComponentResolvers.const(valueNode, stubResolver, {});
        });
        it("returns the const result", function () {
            chai_1.expect(resolvedValue).equals(returnValue);
        });
    });
});
function values(obj) {
    // Typescript does not type Object.keys as T[K] on its own,
    //  probably because it can't be sure of it at runtime.
    const keys = Object.keys(obj);
    return keys.map((x) => obj[x]);
}
//# sourceMappingURL=component-resolver.spec.js.map