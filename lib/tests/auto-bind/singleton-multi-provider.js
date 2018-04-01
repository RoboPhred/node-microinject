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
describe("Integration", function () {
    describe("Singleton multi-provider", function () {
        ;
        ;
        const Left = Symbol("left");
        const Right = Symbol("right");
        let LeftRightImpl = class LeftRightImpl {
            getLeft() {
                return -5;
            }
            getRight() {
                return 5;
            }
        };
        LeftRightImpl = __decorate([
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
//# sourceMappingURL=singleton-multi-provider.js.map