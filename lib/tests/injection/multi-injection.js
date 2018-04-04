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
describe("Multi Injection", function () {
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
        __param(0, __1.inject(InjectedService, { all: true }))
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
//# sourceMappingURL=multi-injection.js.map