"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const microinject_1 = require("microinject");
exports.LeftService = Symbol("LeftService");
// We use a plain string to represent the service to demonstrate that a symbol is not required.
//  It works the same with or without.  Only the Identifier type is important as far as typescript is concerned.
exports.RightService = "RightService";
// This implementation is marked as a singleton, and will be automatically bound to
//  the identifiers: AnnotatedServiceImpl, LeftService, and RightService.
let MultiServiceImpl = class MultiServiceImpl {
    getLeftValue() {
        return 3;
    }
    getRightValue() {
        return 7;
    }
};
MultiServiceImpl = __decorate([
    microinject_1.Injectable(),
    microinject_1.Singleton(),
    microinject_1.Alias(exports.LeftService),
    microinject_1.Alias(exports.RightService)
], MultiServiceImpl);
exports.default = new microinject_1.ContainerModule(bind => {
    // If the argument to bind() is a constructor, it checks for @Alias annotations
    //  to use in addition to using the constructor itself as an alias.
    // It is important to note that the same binding will be used for all identifiers, so
    //  only one instance will be created, and it will be used for
    //  get(MultiServiceImpl), get(LeftService), and get(RightService)
    bind(MultiServiceImpl);
});
//# sourceMappingURL=multi-service.js.map