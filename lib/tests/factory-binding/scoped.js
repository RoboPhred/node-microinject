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
describe("Scoped", function () {
    const TargetScope = Symbol("TargetScope");
    const ScopedService = Symbol("ScopedService");
    const ScopeConsumerA = Symbol("ScopeConsumerA");
    const ScopeConsumerB = Symbol("ScopeConsumerB");
    const ScopeRoot = Symbol("ScopeRoot");
    let container;
    let scopeRoots;
    before(function () {
        var ScopedServiceImpl_1;
        class ScopeRootImpl {
            constructor(consumerA, consumerB) {
                this.consumerA = consumerA;
                this.consumerB = consumerB;
                this._instanceId = ScopeRootImpl.nextInstanceId++;
            }
            getInstanceId() {
                return this._instanceId;
            }
        }
        ScopeRootImpl.nextInstanceId = 1;
        let ScopeConsumerAImpl = class ScopeConsumerAImpl {
            constructor(_scopedService) {
                this._scopedService = _scopedService;
            }
            getScopedService() {
                return this._scopedService;
            }
        };
        ScopeConsumerAImpl = __decorate([
            __1.injectable(),
            __param(0, __1.inject(ScopedService))
        ], ScopeConsumerAImpl);
        let ScopeConsumerBImpl = class ScopeConsumerBImpl {
            constructor(_scopedService) {
                this._scopedService = _scopedService;
            }
            getScopedService() {
                return this._scopedService;
            }
        };
        ScopeConsumerBImpl = __decorate([
            __1.injectable(),
            __param(0, __1.inject(ScopedService))
        ], ScopeConsumerBImpl);
        let ScopedServiceImpl = ScopedServiceImpl_1 = class ScopedServiceImpl {
            constructor() {
                this._instanceId = ScopedServiceImpl_1.nextInstanceId++;
            }
            getInstanceId() {
                return this._instanceId;
            }
        };
        ScopedServiceImpl.nextInstanceId = 1;
        ScopedServiceImpl = ScopedServiceImpl_1 = __decorate([
            __1.injectable()
        ], ScopedServiceImpl);
        container = new __1.Container();
        container
            .bind(ScopeRoot)
            .toDynamicValue(context => {
            const consumerA = context.get(ScopeConsumerA);
            const consumerB = context.get(ScopeConsumerB);
            return new ScopeRootImpl(consumerA, consumerB);
        })
            .asScope(TargetScope);
        container.bind(ScopeConsumerA).to(ScopeConsumerAImpl);
        container.bind(ScopeConsumerB).to(ScopeConsumerBImpl);
        container
            .bind(ScopedService)
            .to(ScopedServiceImpl)
            .inScope(TargetScope);
        scopeRoots = Array.from(new Array(3), () => container.get(ScopeRoot));
    });
    it("creates a new scope root on each request", function () {
        let firstRoot = scopeRoots[0];
        for (let i = 1; i < scopeRoots.length; i++) {
            const nextRoot = scopeRoots[i];
            chai_1.expect(firstRoot).to.not.equal(nextRoot);
        }
    });
    it("returns the same scoped object when in the same scope", function () {
        for (let root of scopeRoots) {
            const firstScoped = root.consumerA.getScopedService();
            const secondScoped = root.consumerB.getScopedService();
            chai_1.expect(firstScoped).to.equal(secondScoped);
        }
    });
    it("returns a different scoped object from each scope root", function () {
        const seen = new Set();
        for (let root of scopeRoots) {
            const scoped = root.consumerA.getScopedService();
            chai_1.expect(seen.has(scoped)).to.be.false;
            seen.add(scoped);
        }
    });
});
//# sourceMappingURL=scoped.js.map