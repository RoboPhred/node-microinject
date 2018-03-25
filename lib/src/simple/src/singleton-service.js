"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const microinject_1 = require("microinject");
exports.SingletonService = Symbol("SingletonService");
// The implementation of the service.  This usually would be elsewhere.
//  Note the @Injectable annotation, which is required to use this class as a container-created class constructor.
let SingletonServiceImpl = class SingletonServiceImpl {
    getMyValue() {
        return 5;
    }
};
SingletonServiceImpl = __decorate([
    microinject_1.Injectable()
], SingletonServiceImpl);
// Export a module which binds and configures our implementation of SingletonService.
exports.default = new microinject_1.ContainerModule(bind => {
    bind(exports.SingletonService).to(SingletonServiceImpl).inSingletonScope();
});
//# sourceMappingURL=singleton-service.js.map