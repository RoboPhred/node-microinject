"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const injection_1 = require("../injection");
const decorators_1 = require("./decorators");
const scope_1 = require("../scope");
const binder_impl_1 = require("./binder-impl");
const errors_1 = require("./errors");
describe("@BinderImpl", function () {
    // Tests for explicit function calls on the binding.
    const identifier = Symbol("test-identifier");
    describe("binding", function () {
        describe("auto-bind", function () {
            it("throws if the target is not a function or class", function () {
                const testValues = [
                    42,
                    "test-string",
                    Symbol("test-symbol"),
                    { name: "test-obect" }
                ];
                function tryBindValue(value) {
                    const binder = new binder_impl_1.BinderImpl(value);
                    return binder._getBinding();
                }
                testValues.forEach(value => {
                    chai_1.expect(() => tryBindValue(value)).to.throw(errors_1.BindingConfigurationError);
                });
            });
            it("throws if the target is a non-injectable class", function () {
                class TestBlankClass {
                }
                const binder = new binder_impl_1.BinderImpl(TestBlankClass);
                chai_1.expect(() => binder._getBinding()).to.throw(errors_1.BindingConfigurationError);
            });
            it("throws if the target is a non-factory function", function () {
                function testFactory() { }
                const binder = new binder_impl_1.BinderImpl(testFactory);
                chai_1.expect(() => binder._getBinding()).to.throw(errors_1.BindingConfigurationError);
            });
            describe("with an @injectable class identifier", function () {
                let TestAutoBindClass = class TestAutoBindClass {
                };
                TestAutoBindClass = __decorate([
                    injection_1.injectable(identifier)
                ], TestAutoBindClass);
                let binding;
                before(function () {
                    const binder = new binder_impl_1.BinderImpl(TestAutoBindClass);
                    binding = binder._getBinding();
                });
                it("generates a constructor binding", function () {
                    chai_1.expect(binding)
                        .property("type")
                        .equals("constructor");
                });
                it("sets binding.ctor to the constructor", function () {
                    chai_1.expect(binding)
                        .property("ctor")
                        .equals(TestAutoBindClass);
                });
            });
            describe("with a @factory function identifier", function () {
                function testFactory() { }
                decorators_1.factory()(testFactory);
                let binding;
                before(function () {
                    const binder = new binder_impl_1.BinderImpl(testFactory);
                    binding = binder._getBinding();
                });
                it("generates a factory binding", function () {
                    chai_1.expect(binding)
                        .property("type")
                        .equals("factory");
                });
                it("sets binding.factory to the factory", function () {
                    chai_1.expect(binding)
                        .property("factory")
                        .equals(testFactory);
                });
            });
        });
        describe(".to()", function () {
            class TestBlankClass {
            }
            let binding;
            before(function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binding = binder._getBinding();
            });
            it("generates a constructor binding", function () {
                chai_1.expect(binding)
                    .property("type")
                    .equals("constructor");
            });
            it("sets binding.ctor to the provided constructor", function () {
                chai_1.expect(binding)
                    .property("ctor")
                    .equals(TestBlankClass);
            });
        });
        describe(".toDynamicValue()", function () {
            function testFactory() { }
            let binding;
            before(function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.toDynamicValue(testFactory);
                binding = binder._getBinding();
            });
            it("generates a factory binding", function () {
                chai_1.expect(binding)
                    .property("type")
                    .equals("factory");
            });
            it("sets binding.factory to the provided factory", function () {
                chai_1.expect(binding)
                    .property("factory")
                    .equals(testFactory);
            });
        });
        describe(".toConstantValue()", function () {
            const boundValue = 42;
            let binding;
            before(function () {
                const impl = new binder_impl_1.BinderImpl(identifier);
                impl.toConstantValue(boundValue);
                binding = impl._getBinding();
            });
            it("generates a value binding", function () {
                chai_1.expect(binding)
                    .property("type")
                    .equals("value");
            });
            it("sets binding.value to the provided value", function () {
                chai_1.expect(binding)
                    .property("value")
                    .equals(boundValue);
            });
        });
    });
    describe("scoping", function () {
        class TestBlankClass {
        }
        const AutoBoundScope = "auto-bound-scope";
        let TestAutoBoundClass = class TestAutoBoundClass {
        };
        TestAutoBoundClass = __decorate([
            injection_1.injectable(),
            scope_1.inScope(AutoBoundScope)
        ], TestAutoBoundClass);
        it("defaults binding.createInScope to null", function () {
            const binder = new binder_impl_1.BinderImpl(identifier);
            binder.to(TestBlankClass);
            let binding = binder._getBinding();
            chai_1.expect(binding).property("createInScope").to.be.null;
        });
        describe("auto-bind", function () {
            it("uses the scope specified by the @inScope decorator", function () {
                const binder = new binder_impl_1.BinderImpl(TestAutoBoundClass);
                let binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("createInScope")
                    .equals(AutoBoundScope);
            });
        });
        describe(".toSingletonScope()", function () {
            it("sets binding.createInScope to the singleton scope", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.inSingletonScope();
                let binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("createInScope")
                    .equals(scope_1.SingletonScope);
            });
            it("overrides the @isScope decorator", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestAutoBoundClass);
                binder.inSingletonScope();
                let binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("createInScope")
                    .equals(scope_1.SingletonScope);
            });
            it("throws if the scope is already configured", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.inScope("PreviouslyBoundScope");
                chai_1.expect(() => binder.inSingletonScope()).to.throw(errors_1.BindingConfigurationError);
            });
            it("throws if used on a value binding", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.toConstantValue(42);
                chai_1.expect(() => binder.inSingletonScope()).to.throw(errors_1.BindingConfigurationError);
            });
        });
        describe(".toTransientScope()", function () {
            it("sets binding.createInScope to null", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.inTransientScope();
                let binding = binder._getBinding();
                chai_1.expect(binding).property("createInScope").to.be.null;
            });
            it("overrides the @isScope decorator", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestAutoBoundClass);
                binder.inTransientScope();
                let binding = binder._getBinding();
                chai_1.expect(binding).property("createInScope").to.be.null;
            });
            it("throws if the scope is already configured", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.inScope("PreviouslyBoundScope");
                chai_1.expect(() => binder.inTransientScope()).to.throw(errors_1.BindingConfigurationError);
            });
            it("throws if used on a value binding", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.toConstantValue(42);
                chai_1.expect(() => binder.inTransientScope()).to.throw(errors_1.BindingConfigurationError);
            });
        });
        describe(".createInScope()", function () {
            const scope = "test-scope";
            it("sets binding.createInScope to the scope", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.inScope(scope);
                let binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("createInScope")
                    .equals(scope);
            });
            it("overrides the @inScope decorator", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestAutoBoundClass);
                binder.inScope(scope);
                let binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("createInScope")
                    .equals(scope);
            });
            it("throws if the scope is already configured", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.inScope("PreviouslyBoundScope");
                chai_1.expect(() => binder.inScope("new-scope")).to.throw(errors_1.BindingConfigurationError);
            });
            it("throws if used on a value binding", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.toConstantValue(42);
                chai_1.expect(() => binder.inScope(scope)).to.throw(errors_1.BindingConfigurationError);
            });
        });
    });
    describe(".asScope()", function () {
        class TestBlankClass {
        }
        const AutoBoundScope = "auto-bound-scope";
        let TestAutoBoundClass = class TestAutoBoundClass {
        };
        TestAutoBoundClass = __decorate([
            injection_1.injectable(),
            scope_1.asScope(AutoBoundScope)
        ], TestAutoBoundClass);
        it("defaults binding.definesScope to null", function () {
            const binder = new binder_impl_1.BinderImpl(identifier);
            binder.to(TestBlankClass);
            let binding = binder._getBinding();
            chai_1.expect(binding).property("definesScope").to.be.null;
        });
        it("throws if used on a value binding", function () {
            const binder = new binder_impl_1.BinderImpl(identifier);
            binder.toConstantValue(42);
            chai_1.expect(() => binder.asScope("some-scope")).to.throw(errors_1.BindingConfigurationError);
        });
        it("throws if a scope has already been defined", function () {
            const binder = new binder_impl_1.BinderImpl(identifier);
            binder.to(TestBlankClass);
            binder.asScope("previous-scope");
            chai_1.expect(() => binder.asScope("some-scope")).to.throw(errors_1.BindingConfigurationError);
        });
        describe("auto-bind", function () {
            it("uses the scope specified by the @asScope decorator", function () {
                const binder = new binder_impl_1.BinderImpl(TestAutoBoundClass);
                let binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("definesScope")
                    .equals(AutoBoundScope);
            });
        });
        describe("with a specified scope", function () {
            const scope = "test-scope";
            it("sets binding.definesScope to the specified scope", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.asScope(scope);
                const binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("definesScope")
                    .equals(scope);
            });
            it("overrides the asScope decorator", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestAutoBoundClass);
                binder.asScope(scope);
                const binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("definesScope")
                    .equals(scope);
            });
        });
        describe("with no scope specified", function () {
            it("sets binding.definesScope to the binding identifier", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestBlankClass);
                binder.asScope();
                const binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("definesScope")
                    .equals(identifier);
            });
            it("overrides the asScope decorator", function () {
                const binder = new binder_impl_1.BinderImpl(identifier);
                binder.to(TestAutoBoundClass);
                binder.asScope();
                const binding = binder._getBinding();
                chai_1.expect(binding)
                    .property("definesScope")
                    .equals(identifier);
            });
        });
    });
});
//# sourceMappingURL=binder-impl.spec.js.map