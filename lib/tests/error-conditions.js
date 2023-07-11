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
const __1 = require("..");
const scope_1 = require("../scope");
describe("Error Conditions", function () {
    it("missing injections throw a DependencyResolutionError", function () {
        const IdentifierA = Symbol("IdentifierA");
        const IdentifierB = Symbol("IdentifierB");
        let ClassA = class ClassA {
            constructor(b) {
                this.b = b;
            }
        };
        ClassA = __decorate([
            __1.injectable(),
            __1.provides(IdentifierA),
            __param(0, __1.inject(IdentifierB))
        ], ClassA);
        const container = new __1.Container();
        container.bind(ClassA);
        chai_1.expect(() => {
            container.get(IdentifierA);
        }).to.throw(__1.DependencyResolutionError);
        // Ensure it happens twice, so the cache doesn't interfere.
        chai_1.expect(() => {
            container.get(IdentifierA);
        }).to.throw(__1.DependencyResolutionError);
    });
    it("missing singleton injections throw a DependencyResolutionError", function () {
        const IdentifierA = Symbol("IdentifierA");
        const IdentifierB = Symbol("IdentifierB");
        let ClassA = class ClassA {
            constructor(b) {
                this.b = b;
            }
        };
        ClassA = __decorate([
            __1.injectable(),
            scope_1.singleton(),
            __1.provides(IdentifierA),
            __param(0, __1.inject(IdentifierB))
        ], ClassA);
        const container = new __1.Container();
        container.bind(ClassA);
        chai_1.expect(() => {
            container.get(IdentifierA);
        }).to.throw(__1.DependencyResolutionError);
        // Ensure it happens twice, so the cache doesn't interfere.
        chai_1.expect(() => {
            container.get(IdentifierA);
        }).to.throw(__1.DependencyResolutionError);
    });
    it("circular constructor dependencies throw DependencyResolutionError", function () {
        const IdentifierA = Symbol("IdentifierA");
        const IdentifierB = Symbol("IdentifierB");
        let ClassA = class ClassA {
            constructor(b) {
                this.b = b;
            }
        };
        ClassA = __decorate([
            __1.injectable(),
            __1.provides(IdentifierA),
            __param(0, __1.inject(IdentifierB))
        ], ClassA);
        let ClassB = class ClassB {
            constructor(a) {
                this.a = a;
            }
        };
        ClassB = __decorate([
            __1.injectable(),
            __1.provides(IdentifierB),
            __param(0, __1.inject(IdentifierA))
        ], ClassB);
        const container = new __1.Container();
        container.bind(ClassA);
        container.bind(ClassB);
        chai_1.expect(() => {
            container.get(IdentifierA);
        }).to.throw(__1.DependencyResolutionError, /Circular/);
    });
    it("circular property dependencies throw DependencyResolutionError", function () {
        const IdentifierA = Symbol("IdentifierA");
        const IdentifierB = Symbol("IdentifierB");
        let ClassA = class ClassA {
        };
        __decorate([
            __1.inject(IdentifierB)
        ], ClassA.prototype, "b", void 0);
        ClassA = __decorate([
            __1.injectable(),
            __1.provides(IdentifierA)
        ], ClassA);
        let ClassB = class ClassB {
        };
        __decorate([
            __1.inject(IdentifierA)
        ], ClassB.prototype, "a", void 0);
        ClassB = __decorate([
            __1.injectable(),
            __1.provides(IdentifierB)
        ], ClassB);
        const container = new __1.Container();
        container.bind(ClassA);
        container.bind(ClassB);
        chai_1.expect(() => {
            container.get(IdentifierA);
        }).to.throw(__1.DependencyResolutionError, /Circular/);
    });
});
//# sourceMappingURL=error-conditions.js.map