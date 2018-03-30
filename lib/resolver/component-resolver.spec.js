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
        const factoryCreator = {
            type: "factory",
            componentId: "factory-component-id",
            factory: factoryStub
        };
        let resolvedValue;
        before(function () {
            resolvedValue = component_resolver_1.defaultComponentResolvers.factory(identifier, factoryCreator, stubResolver);
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
            componentId: "ctor-component-id",
            ctor: constructorStub
        };
        function invokeResolver(args) {
            const creator = Object.assign({}, partialCtorCreator, { args });
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
                identifier: Symbol("first-arg-identifier"),
                componentCreator: {
                    type: "value",
                    componentId: "first-arg-value",
                    value: Symbol("first-arg-value")
                }
            };
            const secondArg = {
                identifier: Symbol("second-arg-identifier"),
                componentCreator: {
                    type: "value",
                    componentId: "first-arg-value",
                    value: Symbol("second-arg-value")
                }
            };
            invokeResolver([firstArg, secondArg]);
            chai_1.expect(stubResolver.resolveInstance).calledTwice;
            chai_1.expect(stubResolver.resolveInstance.firstCall).calledWith(firstArg);
            chai_1.expect(stubResolver.resolveInstance.secondCall).calledWith(secondArg);
        });
        it("passes the resolved arguments to the constructor", function () {
            const firstArgValue = Symbol("first-arg-value");
            const firstArg = {
                identifier: Symbol("first-arg-identifier"),
                componentCreator: {
                    type: "value",
                    componentId: "first-arg-value",
                    value: firstArgValue
                }
            };
            const secondArgValue = Symbol("second-arg-value");
            const secondArg = {
                identifier: Symbol("second-arg-identifier"),
                componentCreator: {
                    type: "value",
                    componentId: "first-arg-value",
                    value: secondArgValue
                }
            };
            stubResolver.resolveInstance.withArgs(firstArg).returns(firstArgValue);
            stubResolver.resolveInstance.withArgs(secondArg).returns(secondArgValue);
            invokeResolver([firstArg, secondArg]);
            chai_1.expect(constructorStub).calledWith(firstArgValue, secondArgValue);
        });
        it("throws on circular dependencies", function () {
            const classA = {
                identifier: Symbol("class-a"),
                componentCreator: {
                    type: "constructor",
                    componentId: "class-a",
                    ctor: sinon_1.stub(),
                    args: []
                }
            };
            const classB = {
                identifier: Symbol("class-b"),
                componentCreator: {
                    type: "constructor",
                    componentId: "class-b",
                    ctor: sinon_1.stub(),
                    args: [classA]
                }
            };
            classA.componentCreator.args.push(classB);
            // Simulate resolving class B, when requested by class A.
            //  class B will then request class A, and we expect this to error.
            stubResolver.isResolving.withArgs(classA).returns(true);
            stubResolver.isResolving.withArgs(classB).returns(true);
            stubResolver.getResolveStack.returns([classA, classB]);
            chai_1.expect(() => component_resolver_1.defaultComponentResolvers.ctor(identifier, classB.componentCreator, stubResolver)).to.throw(__1.DependencyResolutionError, /cyclic/);
        });
    });
    describe(".value", function () {
        const identifier = Symbol("value-identifier");
        const returnValue = Symbol("return-value");
        const valueCreator = {
            type: "value",
            componentId: "value-component-id",
            value: returnValue
        };
        let resolvedValue;
        before(function () {
            resolvedValue = component_resolver_1.defaultComponentResolvers.value(identifier, valueCreator, stubResolver);
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