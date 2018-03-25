
import {
    Identifier,
    ContainerModule,
    Injectable,
    Singleton,
    Alias
} from "microinject";

// Create and export an interface / identifier pair so typescript can type the service correctly.
export interface LeftService {
    getLeftValue(): number;
}
export const LeftService = Symbol("LeftService") as Identifier<LeftService>;

// Create another service that will also be implemented by the same implementation.
//  This is to demonstrate annotation based multi-binding with AutobindTo.
export interface RightService {
    getRightValue(): number;
}
// We use a plain string to represent the service to demonstrate that a symbol is not required.
//  It works the same with or without.  Only the Identifier type is important as far as typescript is concerned.
export const RightService = "RightService" as Identifier<RightService>;


// This implementation is marked as a singleton, and will be automatically bound to
//  the identifiers: AnnotatedServiceImpl, LeftService, and RightService.
@Injectable()
@Singleton()
@Alias(LeftService)
@Alias(RightService)
class MultiServiceImpl implements LeftService, RightService {
    getLeftValue(): number {
        return 3;
    }

    getRightValue(): number {
        return 7;
    }
}



export default new ContainerModule(bind => {
    // If the argument to bind() is a constructor, it checks for @Alias annotations
    //  to use in addition to using the constructor itself as an alias.
    // It is important to note that the same binding will be used for all identifiers, so
    //  only one instance will be created, and it will be used for
    //  get(MultiServiceImpl), get(LeftService), and get(RightService)
    bind(MultiServiceImpl);
});