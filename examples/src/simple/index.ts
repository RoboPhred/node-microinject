
// For local test compatibility
try {
    require.resolve("microinject");
}
catch {
    const mockRequire = require("mock-require");
    // Require root project workspace
    mockRequire("microinject", require("../../.."));
}

import {
    Singleton,
    Identifier,
    Container
} from "microinject";


// Pull in our service modules (default exports), and contracts.
//  Note that the contracts pulls in both the interface and the const export.
import ServiceLocatorModule, { ServiceLocator } from "./service-locator";
import SingletonServiceModule, { SingletonService } from "./singleton-service";
import MultiServiceModule, { LeftService, RightService } from "./multi-service";
import ScopedServiceModule, { ScopeRootService } from "./scoped-service";

const container = new Container();
container.load(
    ServiceLocatorModule,
    SingletonServiceModule,
    MultiServiceModule,
    ScopedServiceModule
);


// Simply calling .get() on the exported identifier will allow typescript to infer the return type, so long
//  as the identifier implements Identifier<YourType>
const leftService = container.get(LeftService);
console.log("leftService.getLeftValue() returns " + leftService.getLeftValue());

// Playing around with the service locator.
const serviceLocator = container.get(ServiceLocator);
const rightService = serviceLocator.get(RightService);

console.log("leftValue + rightValue =", leftService.getLeftValue() + rightService.getRightValue());


// Showing that singleton functionality works.
const singleton1 = container.get(SingletonService);
const singleton2 = container.get(SingletonService);
const singleton3 = container.get(SingletonService);
console.log("Number of singletons:", singleton3.getNumberOfInstances());


// Showing that custom scopes work.
//  ScopeRootService creates a scope and 3 ShareConsumers.
//  each ShareConsumer then requests a ScopeSharedService, which is scoped to the ScopeRootService.
// All 3 ShareConsumers in a ScopeRootService should therefor have the same ScopeSharedService.
const scopeRoots = [
    container.get(ScopeRootService),
    container.get(ScopeRootService),
    container.get(ScopeRootService)
];

for (let i = 0; i < scopeRoots.length; i++) {
    const root  = scopeRoots[i];
    const sharedIDs = root.getShareConsumers().map(x => `{ consumerId: ${x.getConsumerId()}, scopeSharedId: ${x.getScopeSharedId()} }`);
    console.log(`Scope root ${i} has these ShareConsumers: [${sharedIDs.join(", ")}]`)
}