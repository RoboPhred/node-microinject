
import { expect } from "chai";
import { describe } from "mocha";
import * as sinon from "sinon";

import {
    Context
} from "./interfaces";

import {
    ScopedBindingImpl
} from "./binding-impl";

describe("bindings", function () {

    const identifier = "default-identifier";
    let context: Context;
    beforeEach(function () {
        context = {
            container: sinon.mock() as any,
            scopes: new Map()
        };
    });

    describe("@ScopedBindingImpl", function () {
        function testTransientBoundValues() {
            it("#_getBoundValue generates a new value on each call", function () {
                const valueCreator = sinon.stub();

                const subject = new ScopedBindingImpl(identifier, valueCreator);

                for (let i = 0; i < 3; i++) {
                    const expectedValue = `expected-value:${i}`;
                    valueCreator.onCall(i).returns(expectedValue);

                    const result = subject._getBoundValue(context);

                    expect(result).to.equal(expectedValue);
                }
            });
        }

        describe("unconfigured", function () {
            testTransientBoundValues();
        });

        describe("with #inTransientScope", function () {
            testTransientBoundValues();
        });

        describe("with #inSingletonScope", function () {
            it("#_getBoundValue returns the same object every call", function () {
                const expectedValue = "expected-value:singleton";
                const valueCreator = sinon.stub();
                valueCreator.onFirstCall().returns(expectedValue);

                const subject = new ScopedBindingImpl(identifier, valueCreator);
                subject.inSingletonScope();

                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context);
                    expect(result).to.equal(expectedValue);
                }
            });
        });

        describe("with #inScope", function() {
            it("#_getBoundValue creates one object per scope", function() {
                const scope = "scope-identifier";

                const firstScopeId = "scope-1";
                const firstScopeValue = "expected-value:first-scope";

                const secondScopeId = "scope-2";
                const secondScopeValue = "expected-value:second-scope";

                const valueCreator = sinon.stub();
                valueCreator.onFirstCall().returns(firstScopeValue);
                valueCreator.onSecondCall().returns(secondScopeValue);

                const subject = new ScopedBindingImpl(identifier, valueCreator);
                subject.inScope(scope);

                // First scope.
                context = {
                    ...context,
                    scopes: new Map().set(scope, firstScopeId)
                };
                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context)
                    expect(result).to.equal(firstScopeValue);
                }

                // Second scope.
                context = {
                    ...context,
                    scopes: new Map().set(scope, secondScopeId)
                };
                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context)
                    expect(result).to.equal(secondScopeValue);
                }
            });
        });
    });

    describe("with #asScope", function() {
        it("leaves the parent context scope unchanged", function() {
            const valueCreator = sinon.stub();

            const subject = new ScopedBindingImpl(identifier, valueCreator);
            subject.asScope(identifier);

            const scopeInstanceBeforeValueCreation = context.scopes.get(identifier);
            subject._getBoundValue(context);
            expect(context.scopes.get(identifier)).to.equal(scopeInstanceBeforeValueCreation);
        });
        
        describe("when no scope is given", function() {
            it("uses own identifier as the scope identifier in the child context", function() {
                const expectedValue = "has-correct-scope";
                const unexpectedValue = "has-wrong-scope";
                const valueCreator = (childContext: Context) => {
                    return childContext.scopes.has(identifier) ? expectedValue : unexpectedValue;
                };

                const subject = new ScopedBindingImpl(identifier, valueCreator);
                subject.asScope();

                const result = subject._getBoundValue(context);
                expect(result).to.equal(expectedValue);
            });
        });

        describe("when a scope identifier is given", function() {
            it("uses the scope identifier in the child context", function() {
                const scopeIdentifier = "custom-scope-identifier";

                const expectedValue = "has-correct-scope";
                const unexpectedValue = "has-wrong-scope";
                const valueCreator = (childContext: Context) => {
                    return childContext.scopes.has(scopeIdentifier) ? expectedValue : unexpectedValue;
                };

                const subject = new ScopedBindingImpl(identifier, valueCreator);
                subject.asScope(scopeIdentifier);

                const result = subject._getBoundValue(context);
                expect(result).to.equal(expectedValue);
            });
        });
    });
});