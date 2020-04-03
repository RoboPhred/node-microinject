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
const container_1 = require("../container");
const injection_1 = require("../injection");
const errors_1 = require("../errors");
describe("Parameters", function () {
    describe("container.get()", function () {
        const paramName = "Param1";
        let ParamReceiver = class ParamReceiver {
            constructor(param) {
                this.param = param;
            }
        };
        ParamReceiver = __decorate([
            __param(0, injection_1.injectParam(paramName))
        ], ParamReceiver);
        let OptionalParamReceiver = class OptionalParamReceiver {
            constructor(param) {
                this.param = param;
            }
        };
        OptionalParamReceiver = __decorate([
            __param(0, injection_1.injectParam(paramName, { optional: true }))
        ], OptionalParamReceiver);
        let container;
        beforeEach(() => {
            container = new container_1.Container();
            container.bind(ParamReceiver).toSelf();
            container.bind(OptionalParamReceiver).toSelf();
        });
        it("injects the param on the created instance", function () {
            const paramValue = 42;
            const instance = container.get(ParamReceiver, {
                [paramName]: paramValue
            });
            chai_1.expect(instance.param).to.equal(paramValue);
        });
        it("when a non-optional parameter is not supplied it throws an error", function () {
            const create = () => container.get(ParamReceiver);
            chai_1.expect(create).throws(errors_1.ParameterNotSuppliedError, /Param1/);
        });
        it("when an optional parameter is not supplied it injects null", function () {
            const instance = container.get(OptionalParamReceiver);
            chai_1.expect(instance.param).to.be.null;
        });
    });
    describe("container.create()", function () {
        let container;
        const param1 = "Param1";
        const param1Value = 1;
        let ParamReceiver = class ParamReceiver {
            constructor(param1) {
                this.param1 = param1;
            }
        };
        ParamReceiver = __decorate([
            injection_1.injectable(),
            __param(0, injection_1.injectParam(param1))
        ], ParamReceiver);
        let OptionalParamReceiver = class OptionalParamReceiver {
            constructor(param1) {
                this.param1 = param1;
            }
        };
        OptionalParamReceiver = __decorate([
            injection_1.injectable(),
            __param(0, injection_1.injectParam(param1, { optional: true }))
        ], OptionalParamReceiver);
        beforeEach(() => {
            container = new container_1.Container();
        });
        it("injects the param on the created instance", function () {
            const instance = container.create(ParamReceiver, {
                [param1]: param1Value
            });
            chai_1.expect(instance.param1).to.equal(param1Value);
        });
        it("when a non-optional parameter is not supplied it throws an error", function () {
            const create = () => container.create(ParamReceiver);
            chai_1.expect(create).throws(errors_1.ParameterNotSuppliedError, /Param1/);
        });
        it("when an optional parameter is not supplied it injects null", function () {
            const instance = container.create(OptionalParamReceiver);
            chai_1.expect(instance.param1).to.be.null;
        });
    });
});
//# sourceMappingURL=parameters.js.map