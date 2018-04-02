"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const __1 = require("../..");
describe("Singleton", function () {
    const TestSingleton = Symbol("TestSingleton");
    let container;
    before(function () {
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
        var TestSingletonImpl_1;
    });
    it("generates a single instance for all requests", function () {
        const singleton = container.get(TestSingleton);
        const otherRequests = Array.from(new Array(3), () => container.get(TestSingleton));
        for (let other of otherRequests) {
            chai_1.expect(other).to.equal(singleton);
        }
    });
});
//# sourceMappingURL=singleton.js.map