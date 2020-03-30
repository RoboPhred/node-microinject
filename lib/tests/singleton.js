"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const __1 = require("..");
describe("Singleton", function () {
    const TestSingleton = Symbol("TestSingleton");
    describe("auto-bound", function () {
        let container;
        before(function () {
            var TestSingletonImpl_1;
            let TestSingletonImpl = TestSingletonImpl_1 = class TestSingletonImpl {
                constructor() {
                    this._instanceId = TestSingletonImpl_1.nextInstanceId++;
                }
                getInstanceId() {
                    return this._instanceId;
                }
            };
            TestSingletonImpl.nextInstanceId = 1;
            TestSingletonImpl = TestSingletonImpl_1 = __decorate([
                __1.injectable(TestSingleton),
                __1.singleton()
            ], TestSingletonImpl);
            container = new __1.Container();
            container.bind(TestSingletonImpl);
        });
        it("generates a single instance for all requests", function () {
            const instance = container.get(TestSingleton);
            const requestCount = 3;
            const otherRequests = Array.from(new Array(requestCount), () => container.get(TestSingleton));
            for (let other of otherRequests) {
                chai_1.expect(other).to.equal(instance);
            }
        });
    });
});
//# sourceMappingURL=singleton.js.map