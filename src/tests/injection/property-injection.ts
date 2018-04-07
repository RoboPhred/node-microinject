
import { expect } from "chai";

import {
    Container,
    inject,
    injectable,
    DependencyResolutionError,
    optional
} from "../..";

describe("Property Injection", function () {
    const InjectedValue = Symbol("InjectedValue");
    const testValue = Symbol("test-value");
    const preValue = Symbol("pre-inject-value");

    describe("default", function () {
        @injectable()
        class TestTarget {
            @inject(InjectedValue)
            injectedValueProp: any = preValue;
        }

        describe("when injected identifier is bound", function() {
            it("injects the value into the property", function () {
                const container = new Container();
                container.bind(InjectedValue).toConstantValue(testValue);
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
    
                expect(instance.injectedValueProp).to.equal(testValue);
            });
        })
        
        describe("when injected identifier is not bound", function() {
            it("throws an error if the value is not found", function() {
                const container = new Container();
                container.bind(TestTarget).to(TestTarget);
    
                expect(() => container.get(TestTarget)).to.throw(DependencyResolutionError, /InjectedValue/);
            });
        });
    });

    describe("optional", function() {
        @injectable()
        class TestTarget {
            @inject(InjectedValue)
            @optional()
            injectedValueProp: any = preValue;
        }

        describe("when injected identifier is bound", function() {
            it("injects the value into the property when available", function () {
                const container = new Container();
                container.bind(InjectedValue).toConstantValue(testValue);
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
                expect(instance.injectedValueProp).to.equal(testValue);
            });
        });

        describe("when injected identifier is not bound", function() {
            it("sets the property to null", function() {
                const container = new Container();
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
                expect(instance.injectedValueProp).to.be.null;
            });
        });
    });
});
