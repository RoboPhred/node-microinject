"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const sinon = require("sinon");
const binding_impl_1 = require("./binding-impl");
mocha_1.describe("bindings", function () {
    const identifier = "identifier";
    let context;
    beforeEach(function () {
        context = {
            container: sinon.mock(),
            scopes: new Map()
        };
    });
    mocha_1.describe("@ScopedBindingImpl", function () {
        function testTransientBoundValues() {
            it("generates a new value on each call", function () {
                const valueCreator = sinon.stub();
                const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
                for (let i = 0; i < 3; i++) {
                    const expectedValue = `expected-value-${i}`;
                    valueCreator.onCall(i).returns(expectedValue);
                    const result = subject._getBoundValue(context);
                    chai_1.expect(result).to.equal(expectedValue);
                }
            });
        }
        mocha_1.describe("unconfigured", function () {
            mocha_1.describe("#_getBoundValue", function () {
                testTransientBoundValues();
            });
        });
        mocha_1.describe("with #inTransientScope", function () {
            mocha_1.describe("#_getBoundValue", function () {
                testTransientBoundValues();
            });
        });
        mocha_1.describe("with #inSingletonScope", function () {
            it("#_getBoundValue", function () {
                const expectedValue = "expected-value-singleton";
                const valueCreator = sinon.stub().returns(expectedValue);
                const subject = new binding_impl_1.ScopedBindingImpl(identifier, valueCreator);
                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context);
                    chai_1.expect(result).to.equal(expectedValue);
                }
            });
        });
    });
});
//# sourceMappingURL=binding-impl.spec.js.map