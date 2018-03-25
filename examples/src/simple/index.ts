
import {
    Container, Singleton, Identifier
} from "microinject";


// Pull in our service modules (default exports), and contracts.
//  Note that the contracts pulls in both the interface and the const export.
import ServiceLocatorModule, { ServiceLocator } from "./service-locator";
import SingletonServiceModule, { SingletonService } from "./singleton-service";
import MultiServiceModule, { LeftService, RightService } from "./multi-service";

const container = new Container();
container.load(
    ServiceLocatorModule,
    SingletonServiceModule,
    MultiServiceModule
);


// Simply calling .get() on the exported identifier will allow typescript to infer the return type, so long
//  as the identifier implements Identifier<YourType>
const leftService = container.get(LeftService);
console.log("leftService.getLeftValue() returns " + leftService.getLeftValue());

// Playing around with the service locator.
const serviceLocator = container.get(ServiceLocator);
const rightService = serviceLocator.get(RightService);

console.log("leftValue + rightValue =", leftService.getLeftValue() + rightService.getRightValue());

