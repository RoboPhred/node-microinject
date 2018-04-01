
import { use as chaiUse, expect } from "chai";

import sinonChai = require("sinon-chai");
chaiUse(sinonChai);

import {
    SinonStub,
    stub,
    spy,
    match
} from "sinon";


import {
    Identifier,
    Newable
} from "../interfaces";

import {
    DependencyNode,
    ConstDependencyNode,
    FactoryDependencyNode,
    ConstructorDependencyNode
} from "../planner";

import {
    DependencyGraphResolver,
} from "./interfaces";

import {
    defaultComponentResolvers
} from "./component-resolver";
import { DependencyResolutionError } from "..";


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
        const factoryNode: FactoryDependencyNode = {
            type: "factory",
            identifier,
            instanceId: "factory-component-id",
            factory: factoryStub
        };

        let resolvedValue: any;
        before(function() {
            resolvedValue = defaultComponentResolvers.factory(identifier, factoryNode, stubResolver);
        });

        it("invokes the factory", function() {
            expect(factoryStub).calledOnce;
        });

        it("returns the factory result", function() {
            expect(resolvedValue).equals(factoryReturnValue);
        });
    });

    describe(".ctor", function() {
        const firstArgIdent: Identifier = Symbol("first-arg");
        const secondArgIdent: Identifier = Symbol("second-arg");

        // constructors are just functions, so we can use a stub for them.
        const constructorStub: SinonStub & Newable = stub() as any;
        const identifier: Identifier = Symbol("ctor-identifier");
        
        const partialCtorCreator = {
            // Explicitly tag type to make TS happy when building the real creator.
            type: "constructor" as "constructor",
            componentId: "ctor-component-id",
            ctor: constructorStub
        };

        function invokeResolver(args: DependencyNode[]) {
            const creator: ConstructorComponentCreator = {
                ...partialCtorCreator,
                args
            }
            return defaultComponentResolvers.ctor(identifier, creator, stubResolver);
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
            const firstArg: DependencyNode = {
                identifier: Symbol("first-arg-identifier"),
                componentCreator: {
                    type: "value",
                    componentId: "first-arg-value",
                    value: Symbol("first-arg-value")
                }
            }
            const secondArg: DependencyNode = {
                identifier: Symbol("second-arg-identifier"),
                componentCreator: {
                    type: "value",
                    componentId: "first-arg-value",
                    value: Symbol("second-arg-value")
                }
            };

            invokeResolver([firstArg, secondArg]);

            expect(stubResolver.resolveInstance).calledTwice;
            expect(stubResolver.resolveInstance.firstCall).calledWith(firstArg);
            expect(stubResolver.resolveInstance.secondCall).calledWith(secondArg);
        });

        it("passes the resolved arguments to the constructor", function() {
            const firstArgValue = Symbol("first-arg-value");
            const firstArg: DependencyNode = {
                identifier: Symbol("first-arg-identifier"),
                componentCreator: {
                    type: "value",
                    componentId: "first-arg-value",
                    value: firstArgValue
                }
            }

            const secondArgValue = Symbol("second-arg-value");
            const secondArg: DependencyNode = {
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

            expect(constructorStub).calledWith(firstArgValue, secondArgValue);
        });

        it("throws on circular dependencies", function() {
            const classA: ConstructorDependencyGraphNode = {
                identifier: Symbol("class-a"),
                componentCreator: {
                    type: "constructor",
                    componentId: "class-a",
                    ctor: stub() as any,
                    args: []
                }
            };
            const classB: ConstructorDependencyGraphNode = {
                identifier: Symbol("class-b"),
                componentCreator: {
                    type: "constructor",
                    componentId: "class-b",
                    ctor: stub() as any,
                    args: [classA]
                }
            };
            classA.componentCreator.args.push(classB);

            // Simulate resolving class B, when requested by class A.
            //  class B will then request class A, and we expect this to error.
            stubResolver.isResolving.withArgs(classA).returns(true);
            stubResolver.isResolving.withArgs(classB).returns(true);
            stubResolver.getResolveStack.returns([classA, classB]);

            expect(
                () => defaultComponentResolvers.ctor(identifier, classB.componentCreator, stubResolver)
            ).to.throw(DependencyResolutionError, /cyclic/);
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
            resolvedValue = defaultComponentResolvers.const(identifier, valueCreator, stubResolver);
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