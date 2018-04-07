
import { expect } from "chai";

import {
    Container,
    DependencyResolutionError,
    inject,
    injectable,
    optional,
    singleton
} from "../..";

describe("Property Injection", function () {
    const InjectedValue = Symbol("InjectedValue");
    const preValue = Symbol("pre-inject-value");

    describe("default", function () {
        const testValue = Symbol("test-value");

        @injectable()
        class TestTarget {
            @inject(InjectedValue)
            injectedValueProp: any = preValue;
        }

        describe("when injected identifier is bound", function () {
            it("injects the value into the property", function () {
                const container = new Container();
                container.bind(InjectedValue).toConstantValue(testValue);
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);

                expect(instance.injectedValueProp).to.equal(testValue);
            });
        });

        describe("when injected identifier is not bound", function () {
            it("throws an error if the value is not found", function () {
                const container = new Container();
                container.bind(TestTarget).to(TestTarget);

                expect(() => container.get(TestTarget)).to.throw(DependencyResolutionError, /InjectedValue/);
            });
        });
    });

    describe("circular", function () {
        @injectable()
        @singleton()
        class TestTarget {
            @inject(InjectedValue)
            injectedValueProp: TestInjected | null = null;
        }

        @injectable(InjectedValue)
        class TestInjected {
            constructor(
                @inject(TestTarget) public injected: TestTarget
            ) {}
        }

        describe("when injected identifier is bound", function () {
            let instance: TestTarget;
            before(function() {
                const container = new Container();
                container.bind(InjectedValue).to(TestInjected);
                container.bind(TestTarget).to(TestTarget);
                instance = container.get(TestTarget);
            });

            it("injects the value into the property", function () {
                expect(instance.injectedValueProp).to.be.instanceof(TestInjected);
            });

            it("uses the singleton instance", function() {
                expect(instance.injectedValueProp!.injected).to.equal(instance);
            });
        });
    });

    describe("optional", function () {
        const testValue = Symbol("test-value");

        @injectable()
        class TestTarget {
            @inject(InjectedValue)
            @optional()
            injectedValueProp: any = preValue;
        }

        describe("when injected identifier is bound", function () {
            it("injects the value into the property when available", function () {
                const container = new Container();
                container.bind(InjectedValue).toConstantValue(testValue);
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
                expect(instance.injectedValueProp).to.equal(testValue);
            });
        });

        describe("when injected identifier is not bound", function () {
            it("sets the property to null", function () {
                const container = new Container();
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
                expect(instance.injectedValueProp).to.be.null;
            });
        });
    });
});
