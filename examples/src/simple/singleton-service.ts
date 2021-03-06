
import {
    Identifier,
    ContainerModule,
    injectable
} from "microinject";

// Create and export an interface / identifier pair so typescript can type the service correctly.
export interface SingletonService {
    getNumberOfInstances(): number;
}
export const SingletonService = Symbol("SingletonService") as Identifier<SingletonService>;


// Let's count how many singletons we made.
let singletonCtorCounter = 0;

// The implementation of the service.  This usually would be elsewhere.
//  Note the @injectable decorator, which is required to use this class as a container-created class constructor.
@injectable()
class SingletonServiceImpl implements SingletonService {
    constructor() {
        singletonCtorCounter++;
    }
    
    getNumberOfInstances(): number {
        return singletonCtorCounter;
    }
}


// Export a module which binds and configures our implementation of SingletonService.
export default new ContainerModule(bind => {
    // Specify that the service is singleton during binding.
    //  We could also use the @Singleton() decorator on SingletonServiceImpl.
    // Note that if not specified in either location, transient is used.
    //  .inTransientScope is provided to override the decorator, if needed.
    bind(SingletonService).to(SingletonServiceImpl).inSingletonScope();
});