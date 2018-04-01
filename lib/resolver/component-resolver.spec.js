"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinonChai = require("sinon-chai");
chai_1.use(sinonChai);
const sinon_1 = require("sinon");
const component_resolver_1 = require("./component-resolver");
const __1 = require("..");
describe("defaultComponentResolvers", function () {
    const stubResolver = {
        isResolving: sinon_1.stub(),
        getResolveStack: sinon_1.stub(),
        resolveInstance: sinon_1.stub()
    };
    beforeEach(function () {
        values(stubResolver).forEach(x => x.reset());
    });
    describe(".factory", function () {
        const identifier = Symbol("factory-identifier");
        const factoryReturnValue = Symbol("factory-return-value");
        const factoryStub = sinon_1.stub().returns(factoryReturnValue);
        const factoryNode = {
            type: "factory",
            identifier,
            instanceId: "factory-component-id",
            factory: factoryStub
        };
        let resolvedValue;
        before(function () {
            resolvedValue = component_resolver_1.defaultComponentResolvers.factory(identifier, factoryNode, stubResolver);
        });
        it("invokes the factory", function () {
            chai_1.expect(factoryStub).calledOnce;
        });
        it("returns the factory result", function () {
            chai_1.expect(resolvedValue).equals(factoryReturnValue);
        });
    });
    describe(".ctor", function () {
        const firstArgIdent = Symbol("first-arg");
        const secondArgIdent = Symbol("second-arg");
        // constructors are just functions, so we can use a stub for them.
        const constructorStub = sinon_1.stub();
        const identifier = Symbol("ctor-identifier");
        const partialCtorCreator = {
            // Explicitly tag type to make TS happy when building the real creator.
            type: "constructor",
            identifier,
            instanceId: "ctor-instance-id",
            ctor: constructorStub
        };
        function invokeResolver(args) {
            const creator = Object.assign({}, partialCtorCreator, { injections: args.map(arg => ({
                    identifier: arg.identifier
                })), injectionNodes: args });
            return component_resolver_1.defaultComponentResolvers.ctor(identifier, creator, stubResolver);
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
                identifier: Symbol("first-arg-identifier"),
                instanceId: "first-arg-value",
                value: Symbol("first-arg-value")
            };
            const secondArg = {
                type: "value",
                identifier: Symbol("second-arg-identifier"),
                instanceId: "second-arg-value",
                value: Symbol("second-arg-value")
            };
            invokeResolver([firstArg, secondArg]);
            chai_1.expect(stubResolver.resolveInstance).calledTwice;
            chai_1.expect(stubResolver.resolveInstance.firstCall).calledWith(firstArg);
            chai_1.expect(stubResolver.resolveInstance.secondCall).calledWith(secondArg);
        });
        it("passes the resolved arguments to the constructor", function () {
            const firstArgValue = Symbol("first-arg-value");
            const firstArg = {
                type: "value",
                identifier: Symbol("first-arg-identifier"),
                instanceId: "first-arg-value",
                value: firstArgValue
            };
            const secondArgValue = Symbol("second-arg-value");
            const secondArg = {
                type: "value",
                identifier: Symbol("second-arg-identifier"),
                instanceId: "second-arg-value",
                value: secondArgValue
            };
            stubResolver.resolveInstance.withArgs(firstArg).returns(firstArgValue);
            stubResolver.resolveInstance.withArgs(secondArg).returns(secondArgValue);
            invokeResolver([firstArg, secondArg]);
            chai_1.expect(constructorStub).calledWith(firstArgValue, secondArgValue);
        });
        it("throws on circular dependencies", function () {
            const classA = {
                type: "constructor",
                identifier: Symbol("class-a"),
                instanceId: "class-a",
                ctor: sinon_1.stub(),
                injections: [],
                injectionNodes: []
            };
            const classB = {
                type: "constructor",
                identifier: Symbol("class-b"),
                instanceId: "class-b",
                ctor: sinon_1.stub(),
                injections: [{
                        identifier: classA.identifier
                    }],
                injectionNodes: [Object.assign({}, classA)]
            };
            classA.injections.push({
                identifier: classB.identifier
            });
            classA.injectionNodes.push(Object.assign({}, classB));
            // Simulate resolving class B, when requested by class A.
            //  class B will then request class A, and we expect this to error.
            stubResolver.isResolving.withArgs(classA).returns(true);
            stubResolver.isResolving.withArgs(classB).returns(true);
            stubResolver.getResolveStack.returns([classA, classB]);
            chai_1.expect(() => component_resolver_1.defaultComponentResolvers.ctor(identifier, classB, stubResolver)).to.throw(__1.DependencyResolutionError, /cyclic/);
        });
    });
    describe(".value", function () {
        const identifier = Symbol("value-identifier");
        const returnValue = Symbol("return-value");
        const valueNode = {
            type: "value",
            identifier,
            instanceId: "value-component-id",
            value: returnValue
        };
        let resolvedValue;
        before(function () {
            resolvedValue = component_resolver_1.defaultComponentResolvers.const(identifier, valueNode, stubResolver);
        });
        it("returns the value result", function () {
            chai_1.expect(resolvedValue).equals(returnValue);
        });
    });
});
function values(obj) {
    // Typescript does not type Object.keys as T[K] on its own,
    //  probably because it can't be sure of it at runtime.
    const keys = Object.keys(obj);
    return keys.map(x => obj[x]);
}
//# sourceMappingURL=component-resolver.spec.js.map