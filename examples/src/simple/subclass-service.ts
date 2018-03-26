
import { EventEmitter } from "events";

import {
    Identifier,
    Injectable,
    Inject,
    ContainerModule
} from "microinject";


export interface SubclassService extends NodeJS.EventEmitter {
    raiseMyEvent(): void;
}
export const SubclassService = Symbol("SubclassService") as Identifier<SubclassService>;


// Demonstrating that we can extend base classes without modification or monkey-patching.
@Injectable()
class SubclassServiceImpl extends EventEmitter implements SubclassService {
    raiseMyEvent(): void {
        this.emit("my-event", 42);
    }
}

export default new ContainerModule(bind => {
    bind(SubclassService).to(SubclassServiceImpl).inSingletonScope();
});