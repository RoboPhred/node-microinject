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
const injection_1 = require("../injection");
describe("Scopes", function () {
    describe("Instancing", function () {
        const TargetScope = Symbol("TargetScope");
        const ScopedService = Symbol("ScopedService");
        const ScopeConsumerA = Symbol("ScopeConsumerA");
        const ScopeConsumerB = Symbol("ScopeConsumerB");
        const ScopeRoot = Symbol("ScopeRoot");
        describe("factory", function () {
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
                    .toFactory((context) => {
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
        describe("auto-bound class", function () {
            let container;
            let scopeRoots;
            before(function () {
                var ScopeRootImpl_1, ScopedServiceImpl_2;
                let ScopeRootImpl = ScopeRootImpl_1 = class ScopeRootImpl {
                    constructor(consumerA, consumerB) {
                        this.consumerA = consumerA;
                        this.consumerB = consumerB;
                        this._instanceId = ScopeRootImpl_1.nextInstanceId++;
                    }
                    getInstanceId() {
                        return this._instanceId;
                    }
                };
                ScopeRootImpl.nextInstanceId = 1;
                ScopeRootImpl = ScopeRootImpl_1 = __decorate([
                    __1.injectable(ScopeRoot),
                    __1.asScope(TargetScope),
                    __param(0, __1.inject(ScopeConsumerA)),
                    __param(1, __1.inject(ScopeConsumerB))
                ], ScopeRootImpl);
                let ScopeConsumerAImpl = class ScopeConsumerAImpl {
                    constructor(_scopedService) {
                        this._scopedService = _scopedService;
                    }
                    getScopedService() {
                        return this._scopedService;
                    }
                };
                ScopeConsumerAImpl = __decorate([
                    __1.injectable(ScopeConsumerA),
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
                    __1.injectable(ScopeConsumerB),
                    __param(0, __1.inject(ScopedService))
                ], ScopeConsumerBImpl);
                let ScopedServiceImpl = ScopedServiceImpl_2 = class ScopedServiceImpl {
                    constructor() {
                        this._instanceId = ScopedServiceImpl_2.nextInstanceId++;
                    }
                    getInstanceId() {
                        return this._instanceId;
                    }
                };
                ScopedServiceImpl.nextInstanceId = 1;
                ScopedServiceImpl = ScopedServiceImpl_2 = __decorate([
                    __1.injectable(ScopedService),
                    __1.inScope(TargetScope)
                ], ScopedServiceImpl);
                container = new __1.Container();
                container.bind(ScopeRootImpl);
                container.bind(ScopeConsumerAImpl);
                container.bind(ScopeConsumerBImpl);
                container.bind(ScopedServiceImpl);
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
        describe("property injection", function () {
            const Scope = "ScopeRoot";
            let Child = class Child {
                constructor(parent) {
                    this.parent = parent;
                }
            };
            Child = __decorate([
                __1.injectable(),
                __1.inScope(Scope),
                __param(0, injection_1.injectScope(Scope))
            ], Child);
            let Root = class Root {
            };
            __decorate([
                __1.inject(Child)
            ], Root.prototype, "child", void 0);
            Root = __decorate([
                __1.injectable(),
                __1.asScope(Scope)
            ], Root);
            it("successfully instantiates the child", function () {
                const container = new __1.Container();
                container.bind(Child);
                container.bind(Root);
                const root = container.get(Root);
                chai_1.expect(root.child.parent).to.equal(root);
            });
        });
    });
    it("@injectScope injects the scope root", function () {
        const Scope = Symbol("Scope");
        const ScopeRoot = Symbol("ScopeRoot");
        const ScopeConsumer = Symbol("ScopeConsumer");
        let ScopeRootImpl = class ScopeRootImpl {
        };
        __decorate([
            __1.inject(ScopeConsumer)
        ], ScopeRootImpl.prototype, "consumer", void 0);
        ScopeRootImpl = __decorate([
            __1.injectable(ScopeRoot),
            __1.asScope(Scope)
        ], ScopeRootImpl);
        let ScopeConsumerImpl = class ScopeConsumerImpl {
        };
        __decorate([
            injection_1.injectScope(Scope)
        ], ScopeConsumerImpl.prototype, "scopeRoot", void 0);
        ScopeConsumerImpl = __decorate([
            __1.injectable(ScopeConsumer),
            __1.inScope(Scope)
        ], ScopeConsumerImpl);
        const container = new __1.Container();
        container.bind(ScopeRootImpl);
        container.bind(ScopeConsumerImpl);
        const root1 = container.get(ScopeRoot);
        const root2 = container.get(ScopeRoot);
        chai_1.expect(root1).to.not.equal(root2);
        chai_1.expect(root1.consumer.scopeRoot).to.equal(root1);
        chai_1.expect(root2.consumer.scopeRoot).to.equal(root2);
    });
});
//# sourceMappingURL=scopes.js.map