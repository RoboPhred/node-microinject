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
const injection_1 = require("../injection");
const container_1 = require("../container");
describe("parent injection", function () {
    const Target = Symbol("Target");
    const TargetValue = 42;
    describe("direct request", function () {
        it("returns the requested value", function () {
            const parentContainer = new container_1.Container();
            parentContainer.bind(Target).toConstantValue(TargetValue);
            const childContainer = new container_1.Container();
            childContainer.parent = parentContainer;
            const resolved = childContainer.get(Target);
            chai_1.expect(resolved).equals(TargetValue);
        });
    });
    describe("indirect request", function () {
        let TargetProvider = class TargetProvider {
            constructor(target) {
                this.target = target;
            }
        };
        TargetProvider = __decorate([
            injection_1.injectable(),
            __param(0, injection_1.inject(Target))
        ], TargetProvider);
        it("injects the requested value", function () {
            const parentContainer = new container_1.Container();
            parentContainer.bind(Target).toConstantValue(TargetValue);
            const childContainer = new container_1.Container();
            childContainer.parent = parentContainer;
            childContainer.bind(TargetProvider).toSelf();
            const resolved = childContainer.get(TargetProvider);
            chai_1.expect(resolved.target).equals(TargetValue);
        });
    });
});
//# sourceMappingURL=parent.js.map