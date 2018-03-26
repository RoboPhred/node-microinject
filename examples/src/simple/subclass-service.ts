
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

// This is the class we will subclass.
//  We could also subclass EventEmitter directly,
//  however we are subclassing this one to demonstrate
//  how to deal with constructor arguments of the superclass.
class EventRaiser extends EventEmitter {
    constructor(
        private _eventName: string,
        private _eventPayload: any
    ) {
        super();
    }

    raiseEvent(): void {
        this.emit(this._eventName, this._eventPayload);
    }
}


// Lets also inject some data, to show that injection works at the top level
//  and to demonstrate how the user is expected to pass the data to the superclass.
const EventToRaiseIdent = Symbol("EventToRaiase") as Identifier<string>;
const PayloadToRaiseIdent = Symbol("PayloadToRaise") as Identifier<any>;

// Demonstrating that we can extend base classes without modification or monkey-patching.
//  The container considers base classes an implementation detail of the class it is constructing,
//  as the top level class is responsible for calling super().
// This means the container is ignorant of base classes, and they do not need to be marked injectable.
// IMPORTANT: If we did not call the constructor here, the container would not pass any arguments
//  to the inherited constructor, as the superclass does not declare itself @Injectable() either.
@Injectable()
class SubclassServiceImpl extends EventRaiser implements SubclassService {
    constructor(
        @Inject(EventToRaiseIdent) eventToRaise: string,
        @Inject(PayloadToRaiseIdent) payloadToRaise: any
    ) {
        // Call the constructor of our superclass.
        super(eventToRaise, payloadToRaise);
    }

    raiseMyEvent() {
        this.raiseEvent();
    }
}

export default new ContainerModule(bind => {
    bind(SubclassService).to(SubclassServiceImpl).inSingletonScope();
    bind(EventToRaiseIdent).toConstantValue("my-event");
    bind(PayloadToRaiseIdent).toConstantValue(42);
});