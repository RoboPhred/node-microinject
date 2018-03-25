import {
    Identifier,
    ContainerModule,
    Injectable
} from "microinject";

// Create and export an interface / identifier pair so typescript can type the service correctly.
export interface SingletonService {
    getMyValue(): number;
}
export const SingletonService = Symbol("SingletonService") as Identifier<SingletonService>;



// The implementation of the service.  This usually would be elsewhere.
//  Note the @Injectable annotation, which is required to use this class as a container-created class constructor.
@Injectable()
class SingletonServiceImpl implements SingletonService {
    getMyValue(): number {
        return 5;
    }
}


// Export a module which binds and configures our implementation of SingletonService.
export default new ContainerModule(bind => {
    bind(SingletonService).to(SingletonServiceImpl).inSingletonScope();
});