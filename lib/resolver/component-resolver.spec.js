"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinonChai = require("sinon-chai");
chai_1.use(sinonChai);
const sinon_1 = require("sinon");
const component_resolver_1 = require("./component-resolver");
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
        const FirstArgIdent = Symbol("first-arg");
        const SecondArgIdent = Symbol("second-arg");
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
        it("invokes the constructor", function () {
            invokeResolver([]);
            chai_1.expect(constructorStub).calledWithNew;
        });
        it.skip("resolves arguments", function () {
        });
        it.skip("throws on circular dependencies", function () {
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