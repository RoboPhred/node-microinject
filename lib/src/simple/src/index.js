"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microinject_1 = require("microinject");
// Pull in our service modules (default exports), and contracts.
//  Note that the contracts pulls in both the interface and the const export.
const service_locator_1 = require("./service-locator");
const singleton_service_1 = require("./singleton-service");
const multi_service_1 = require("./multi-service");
const container = new microinject_1.Container();
container.load(service_locator_1.default, singleton_service_1.default, multi_service_1.default);
// Simply calling .get() on the exported identifier will allow typescript to infer the return type, so long
//  as the identifier implements Identifier<YourType>
const leftService = container.get(multi_service_1.LeftService);
console.log("leftService.getLeftValue() returns " + leftService.getLeftValue());
// Playing around with the service locator.
const serviceLocator = container.get(service_locator_1.ServiceLocator);
const rightService = serviceLocator.get(multi_service_1.RightService);
console.log("leftValue + rightValue =", leftService.getLeftValue(), rightService.getRightValue());
//# sourceMappingURL=index.js.map