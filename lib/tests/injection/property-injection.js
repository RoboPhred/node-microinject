"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const __1 = require("../..");
describe("Property Injection", function () {
    const InjectedValue = Symbol("InjectedValue");
    const preValue = Symbol("pre-inject-value");
    describe("default", function () {
        const testValue = Symbol("test-value");
        let TestTarget = class TestTarget {
            constructor() {
                this.injectedValueProp = preValue;
            }
        };
        __decorate([
            __1.inject(InjectedValue)
        ], TestTarget.prototype, "injectedValueProp", void 0);
        TestTarget = __decorate([
            __1.injectable()
        ], TestTarget);
        describe("when injected identifier is bound", function () {
            it("injects the value into the property", function () {
                const container = new __1.Container();
                container.bind(InjectedValue).toConstantValue(testValue);
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
                chai_1.expect(instance.injectedValueProp).to.equal(testValue);
            });
        });
        describe("when injected identifier is not bound", function () {
            it("throws an error if the value is not found", function () {
                const container = new __1.Container();
                container.bind(TestTarget).to(TestTarget);
                chai_1.expect(() => container.get(TestTarget)).to.throw(__1.DependencyResolutionError, /InjectedValue/);
            });
        });
    });
    describe("circular", function () {
        let TestTarget = class TestTarget {
            constructor() {
                this.injectedValueProp = null;
            }
        };
        __decorate([
            __1.inject(InjectedValue)
        ], TestTarget.prototype, "injectedValueProp", void 0);
        TestTarget = __decorate([
            __1.injectable(),
            __1.singleton()
        ], TestTarget);
        let TestInjected = class TestInjected {
            constructor(injected) {
                this.injected = injected;
            }
        };
        TestInjected = __decorate([
            __1.injectable(InjectedValue),
            __param(0, __1.inject(TestTarget))
        ], TestInjected);
        describe("when injected identifier is bound", function () {
            let instance;
            before(function () {
                const container = new __1.Container();
                container.bind(InjectedValue).to(TestInjected);
                container.bind(TestTarget).to(TestTarget);
                instance = container.get(TestTarget);
            });
            it("injects the value into the property", function () {
                chai_1.expect(instance.injectedValueProp).to.be.instanceof(TestInjected);
            });
            it("uses the singleton instance", function () {
                chai_1.expect(instance.injectedValueProp.injected).to.equal(instance);
            });
        });
    });
    describe("optional", function () {
        const testValue = Symbol("test-value");
        let TestTarget = class TestTarget {
            constructor() {
                this.injectedValueProp = preValue;
            }
        };
        __decorate([
            __1.inject(InjectedValue),
            __1.optional()
        ], TestTarget.prototype, "injectedValueProp", void 0);
        TestTarget = __decorate([
            __1.injectable()
        ], TestTarget);
        describe("when injected identifier is bound", function () {
            it("injects the value into the property when available", function () {
                const container = new __1.Container();
                container.bind(InjectedValue).toConstantValue(testValue);
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
                chai_1.expect(instance.injectedValueProp).to.equal(testValue);
            });
        });
        describe("when injected identifier is not bound", function () {
            it("sets the property to null", function () {
                const container = new __1.Container();
                container.bind(TestTarget).to(TestTarget);
                const instance = container.get(TestTarget);
                chai_1.expect(instance.injectedValueProp).to.be.null;
            });
        });
    });
});
//# sourceMappingURL=property-injection.js.map