"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const sinonChai = require("sinon-chai");
chai_1.use(sinonChai);
const __1 = require("..");
describe("multi-provider", function () {
    const Left = Symbol("left");
    const Right = Symbol("right");
    describe("singleton", function () {
        describe("factory", function () {
            const instance = {
                getLeft: () => 1,
                getRight: () => 2
            };
            let factory;
            let left;
            let right;
            before(() => {
                factory = sinon_1.spy(() => instance);
                const container = new __1.Container();
                container
                    .bind(Left)
                    .provides(Right)
                    .toFactory(factory)
                    .inSingletonScope();
                left = container.get(Left);
                right = container.get(Right);
            });
            it("invokes the factory once", () => {
                chai_1.expect(factory).callCount(1);
            });
            it("uses the same singleton for both services", () => {
                chai_1.expect(left).equals(right);
            });
        });
        describe("auto-bound", function () {
            var LeftRightImpl_1;
            let LeftRightImpl = LeftRightImpl_1 = class LeftRightImpl {
                constructor() {
                    this._instanceId = LeftRightImpl_1.serviceInstanceCounter++;
                }
                getLeft() {
                    return -5;
                }
                getRight() {
                    return 5;
                }
                toString() {
                    return String(this._instanceId);
                }
            };
            LeftRightImpl.serviceInstanceCounter = 1;
            LeftRightImpl = LeftRightImpl_1 = __decorate([
                __1.injectable(),
                __1.provides(Left),
                __1.provides(Right),
                __1.singleton()
            ], LeftRightImpl);
            let left;
            let right;
            before(function () {
                const container = new __1.Container();
                container.bind(LeftRightImpl);
                left = container.get(Left);
                right = container.get(Right);
            });
            it("uses the same singleton for both services", function () {
                chai_1.expect(left).equals(right);
            });
        });
    });
});
//# sourceMappingURL=multi-provider.js.map