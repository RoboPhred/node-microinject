
import { use as chaiUse, expect } from "chai";

import sinonChai = require("sinon-chai");
chaiUse(sinonChai);

import {
    SinonSpy,
    stub,
    spy,
    SinonStub
} from "sinon";


import {
    Identifier, Newable
} from "../interfaces";

import {
    FactoryComponentCreator,
    ConstructorComponentCreator,
    ValueComponentCreator,
    DependencyGraphNode
} from "../planner";

import {
    DependencyGraphResolver
} from "./interfaces";

import {
    defaultComponentResolvers
} from "./component-resolver";


type StubDependencyGraphResolver = {
    [key in keyof DependencyGraphResolver]: SinonStub
};

describe("defaultComponentResolvers", function() {
    const stubResolver: StubDependencyGraphResolver = {
        isResolving: stub(),
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
        const factoryCreator: FactoryComponentCreator = {
            type: "factory",
            componentId: "factory-component-id",
            factory: factoryStub
        };

        let resolvedValue: any;
        before(function() {
            resolvedValue = defaultComponentResolvers.factory(identifier, factoryCreator, stubResolver);
        });

        it("invokes the factory", function() {
            expect(factoryStub).calledOnce;
        });

        it("returns the factory result", function() {
            expect(resolvedValue).equals(factoryReturnValue);
        });
    });

    describe(".ctor", function() {
        const FirstArgIdent: Identifier = Symbol("first-arg");
        const SecondArgIdent: Identifier = Symbol("second-arg");

        // constructors are just functions, so we can use a stub for them.
        const constructorStub: SinonStub & Newable = stub() as any;
        const identifier: Identifier = Symbol("ctor-identifier");
        const partialCtorCreator = {
            // Explicitly tag type to make TS happy when building the real creator.
            type: "constructor" as "constructor",
            componentId: "ctor-component-id",
            ctor: constructorStub
        };

        function invokeResolver(args: DependencyGraphNode[]) {
            const creator: ConstructorComponentCreator = {
                ...partialCtorCreator,
                args
            }
            return defaultComponentResolvers.ctor(identifier, creator, stubResolver);
        }

        it("invokes the constructor", function() {
            invokeResolver([]);
            expect(constructorStub).calledWithNew;
        });

        it.skip("resolves arguments", function() {

        });

        it.skip("throws on circular dependencies", function() {

        });
    });

    describe(".value", function() {
        const identifier: Identifier = Symbol("value-identifier");
        const returnValue = Symbol("return-value");
        const valueCreator: ValueComponentCreator = {
            type: "value",
            componentId: "value-component-id",
            value: returnValue
        };

        let resolvedValue: any;
        before(function() {
            resolvedValue = defaultComponentResolvers.value(identifier, valueCreator, stubResolver);
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