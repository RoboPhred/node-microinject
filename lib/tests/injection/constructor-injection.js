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
describe("Constructor Injection", function () {
    let FirstArgImpl = class FirstArgImpl {
    };
    FirstArgImpl = __decorate([
        __1.injectable()
    ], FirstArgImpl);
    const FirstArg = Symbol("FirstArg");
    let SecondArgImpl = class SecondArgImpl {
    };
    SecondArgImpl = __decorate([
        __1.injectable()
    ], SecondArgImpl);
    const SecondArg = Symbol("SecondArg");
    describe("default inject", function () {
        const Target = Symbol("Target");
        let TargetImpl = class TargetImpl {
            constructor(firstArg, secondArg) {
                this.firstArg = firstArg;
                this.secondArg = secondArg;
            }
        };
        TargetImpl = __decorate([
            __1.injectable(Target),
            __param(0, __1.inject(FirstArg)),
            __param(1, __1.inject(SecondArg))
        ], TargetImpl);
        describe("with matching bindings", function () {
            let container;
            before(function () {
                container = new __1.Container();
                container.bind(FirstArg).to(FirstArgImpl);
                container.bind(SecondArg).to(SecondArgImpl);
                // Could also sinon stub the ctor and run the decorators on it manually.
                container.bind(TargetImpl);
            });
            function createTarget() {
                return container.get(Target);
            }
            it("receives the args in its constructor", function () {
                const target = createTarget();
                chai_1.expect(target.firstArg).instanceof(FirstArgImpl);
                chai_1.expect(target.secondArg).instanceof(SecondArgImpl);
            });
        });
        describe("without matching bindings", function () {
            let container;
            before(function () {
                container = new __1.Container();
                container.bind(FirstArg).to(FirstArgImpl);
                // Could also sinon stub the ctor and run the decorators on it manually.
                container.bind(TargetImpl);
            });
            function createTarget() {
                return container.get(Target);
            }
            it("throws DependencyResolutionError", function () {
                chai_1.expect(createTarget).throws(__1.DependencyResolutionError, /SecondArg/);
            });
        });
        describe("with multiple matching bindings", function () {
            let container;
            before(function () {
                container = new __1.Container();
                container.bind(FirstArg).to(FirstArgImpl);
                container.bind(SecondArg).to(FirstArgImpl);
                container.bind(SecondArg).to(SecondArgImpl);
                // Could also sinon stub the ctor and run the decorators on it manually.
                container.bind(TargetImpl);
            });
            function createTarget() {
                return container.get(Target);
            }
            it("throws DependencyResolutionError", function () {
                chai_1.expect(createTarget).throws(__1.DependencyResolutionError, /SecondArg/);
            });
        });
    });
    describe("multi inject", function () {
        const InjectedService = Symbol("InjectedService");
        let TestInjectA = class TestInjectA {
        };
        TestInjectA = __decorate([
            __1.injectable(InjectedService)
        ], TestInjectA);
        let TestInjectB = class TestInjectB {
        };
        TestInjectB = __decorate([
            __1.injectable(InjectedService)
        ], TestInjectB);
        let TestTarget = class TestTarget {
            constructor(injected) {
                this.injected = injected;
            }
        };
        TestTarget = __decorate([
            __1.injectable(),
            __param(0, __1.inject(InjectedService)),
            __param(0, __1.all())
        ], TestTarget);
        let instance;
        before(function () {
            const container = new __1.Container();
            container.bind(TestInjectA);
            container.bind(TestInjectB);
            container.bind(TestTarget);
            instance = container.get(TestTarget);
        });
        it("receives all bindings for the injected service", function () {
            chai_1.expect(instance.injected.length).equals(2);
            // Want a more elegant way to test this...
            const first = instance.injected[0];
            const hasA = first instanceof TestInjectA || first instanceof TestInjectB;
            chai_1.expect(hasA).to.be.true;
            const second = instance.injected[1];
            const hasB = second instanceof TestInjectA || second instanceof TestInjectB;
            chai_1.expect(hasB).to.be.true;
        });
    });
    describe("optional singular inject", function () {
        const Target = Symbol("Target");
        let TargetImpl = class TargetImpl {
            constructor(firstArg) {
                this.firstArg = firstArg;
            }
        };
        TargetImpl = __decorate([
            __1.injectable(Target),
            __param(0, __1.inject(FirstArg)),
            __param(0, __1.optional())
        ], TargetImpl);
        describe("with matching binding", function () {
            let container;
            before(function () {
                container = new __1.Container();
                container.bind(FirstArg).to(FirstArgImpl);
                // Could also sinon stub the ctor and run the decorators on it manually.
                container.bind(TargetImpl);
            });
            function createTarget() {
                return container.get(Target);
            }
            it("receives the arg in its constructor", function () {
                const target = createTarget();
                chai_1.expect(target.firstArg).instanceof(FirstArgImpl);
            });
        });
        describe("without matching bindings", function () {
            let container;
            before(function () {
                container = new __1.Container();
                // Could also sinon stub the ctor and run the decorators on it manually.
                container.bind(TargetImpl);
            });
            function createTarget() {
                return container.get(Target);
            }
            it("receives null in its constructor", function () {
                const target = createTarget();
                chai_1.expect(target.firstArg).null;
            });
        });
        describe("with multiple matching bindings", function () {
            let container;
            before(function () {
                container = new __1.Container();
                container.bind(FirstArg).to(FirstArgImpl);
                container.bind(FirstArg).to(SecondArgImpl);
                // Could also sinon stub the ctor and run the decorators on it manually.
                container.bind(TargetImpl);
            });
            function createTarget() {
                return container.get(Target);
            }
            it("throws DependencyResolutionError", function () {
                chai_1.expect(createTarget).throws(__1.DependencyResolutionError, /FirstArg/);
            });
        });
    });
});
//# sourceMappingURL=constructor-injection.js.map