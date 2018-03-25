"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const sinon = require("sinon");
const binding_impl_1 = require("./binding-impl");
mocha_1.describe("bindings", function () {
    const identifier = "default-identifier";
    let context;
    beforeEach(function () {
        context = {
            container: sinon.mock(),
            scopes: new Map()
        };
    });
    mocha_1.describe("@ScopedBindingImpl", function () {
        function testTransientBoundValues() {
            it("#_getBoundValue generates a new value on each call", function () {
                const valueCreator = sinon.stub();
                const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
                for (let i = 0; i < 3; i++) {
                    const expectedValue = `expected-value:${i}`;
                    valueCreator.onCall(i).returns(expectedValue);
                    const result = subject._getBoundValue(context);
                    chai_1.expect(result).to.equal(expectedValue);
                }
            });
        }
        mocha_1.describe("unconfigured", function () {
            testTransientBoundValues();
        });
        mocha_1.describe("with #inTransientScope", function () {
            testTransientBoundValues();
        });
        mocha_1.describe("with #inSingletonScope", function () {
            it("#_getBoundValue returns the same object every call", function () {
                const expectedValue = "expected-value:singleton";
                const valueCreator = sinon.stub();
                valueCreator.onFirstCall().returns(expectedValue);
                const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
                subject.inSingletonScope();
                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context);
                    chai_1.expect(result).to.equal(expectedValue);
                }
            });
        });
        mocha_1.describe("with #inScope", function () {
            it("#_getBoundValue creates one object per scope", function () {
                const scope = "scope-identifier";
                const firstScopeId = "scope-1";
                const firstScopeValue = "expected-value:first-scope";
                const secondScopeId = "scope-2";
                const secondScopeValue = "expected-value:second-scope";
                const valueCreator = sinon.stub();
                valueCreator.onFirstCall().returns(firstScopeValue);
                valueCreator.onSecondCall().returns(secondScopeValue);
                const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
                subject.inScope(scope);
                // First scope.
                context = Object.assign({}, context, { scopes: new Map().set(scope, firstScopeId) });
                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context);
                    chai_1.expect(result).to.equal(firstScopeValue);
                }
                // Second scope.
                context = Object.assign({}, context, { scopes: new Map().set(scope, secondScopeId) });
                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context);
                    chai_1.expect(result).to.equal(secondScopeValue);
                }
            });
        });
    });
    mocha_1.describe("with #asScope", function () {
        mocha_1.describe("when no scope is given", function () {
            it("uses own identifier as the scope identifier in the child context", function () {
                const expectedValue = "has-correct-scope";
                const unexpectedValue = "has-wrong-scope";
                const valueCreator = (childContext) => {
                    return childContext.scopes.has(identifier) ? expectedValue : unexpectedValue;
                };
                const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
                subject.asScope();
                const result = subject._getBoundValue(context);
                chai_1.expect(result).to.equal(expectedValue);
            });
        });
        mocha_1.describe("when a scope identifier is given", function () {
            it("uses the scope identifier in the child context", function () {
                const scopeIdentifier = "custom-scope-identifier";
                const expectedValue = "has-correct-scope";
                const unexpectedValue = "has-wrong-scope";
                const valueCreator = (childContext) => {
                    return childContext.scopes.has(scopeIdentifier) ? expectedValue : unexpectedValue;
                };
                const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
                subject.asScope(scopeIdentifier);
                const result = subject._getBoundValue(context);
                chai_1.expect(result).to.equal(expectedValue);
            });
        });
        it("leaves the parent context scope unchanged", function () {
            const valueCreator = sinon.stub();
            const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
            subject.asScope(identifier);
            const scopeInstanceBeforeValueCreation = context.scopes.get(identifier);
            subject._getBoundValue(context);
            chai_1.expect(context.scopes.get(identifier)).to.equal(scopeInstanceBeforeValueCreation);
        });
    });
});
//# sourceMappingURL=binding-impl.spec.js.map