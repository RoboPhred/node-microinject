
import { expect } from "chai";
import { describe } from "mocha";
import * as sinon from "sinon";

import {
    Context
} from "./interfaces";

import {
    ConstBindingImpl, ScopedBindingImpl
} from "./binding-impl";
import { Container } from ".";

describe("bindings", function () {

    let context: Context;
    beforeEach(function () {
        context = {
            container: sinon.mock() as any,
            scopes: new Map()
        };
    });

    describe("@ScopedBindingImpl", function () {
        function testTransientBoundValues() {
            it("generates a new value on each call", function () {
                const valueCreator = sinon.stub();

                const subject = new ScopedBindingImpl(valueCreator);

                for (let i = 0; i < 3; i++) {
                    const expectedValue = `expected-value-${i}`;
                    valueCreator.onCall(i).returns(expectedValue);

                    const result = subject._getBoundValue(context);

                    expect(result).to.equal(expectedValue);
                }
            });
        }

        describe("unconfigured", function () {
            describe("#_getBoundValue", function () {
                testTransientBoundValues();
            });
        });

        describe("with #inTransientScope", function () {
            describe("#_getBoundValue", function () {
                testTransientBoundValues();
            });
        });

        describe("with #inSingletonScope", function () {
            it("#_getBoundValue", function () {
                const expectedValue = "expected-value-singleton";
                const valueCreator = sinon.stub().returns(expectedValue);

                const subject = new ScopedBindingImpl(valueCreator);

                for (let i = 0; i < 3; i++) {
                    const result = subject._getBoundValue(context);
                    expect(result).to.equal(expectedValue);
                }
            });
        });
    });

    describe("@ConstBindingImpl", function () {
        describe("#_getBoundValue", function () {
            it("returns the constant value", function () {
                const expectedValue = "expected-value-constant";

                const subject = new ConstBindingImpl(expectedValue);

                const result = subject._getBoundValue(context);

                expect(result).to.equal(expectedValue);
            });
        });
    });
});