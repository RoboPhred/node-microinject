
import {
    Identifier,
    Injectable,
    Inject,
    ContainerModule
} from "microinject";


export interface ScopeRootService {
    getShareConsumers(): ShareConsumer[];
}
export const ScopeRootService = Symbol("ScopeRootService") as Identifier<ScopeRootService>;


export interface ScopeSharedService {
    getIdentifier(): string;
}
export const ScopeSharedService = Symbol("ScopedSharedService") as Identifier<ScopeSharedService>;


export interface ShareConsumer {
    getConsumerId(): string;
    getScopeSharedId(): string;
}
export const ShareConsumer = Symbol("ShareConsumer") as Identifier<ShareConsumer>;



@Injectable()
class ScopeRootServiceImpl implements ScopeRootService {
    constructor(
        @Inject(ShareConsumer) private _consumerA: ShareConsumer,
        @Inject(ShareConsumer) private _consumerB: ShareConsumer,
        @Inject(ShareConsumer) private _consumerC: ShareConsumer,
    ) {}

    getShareConsumers(): ShareConsumer[] {
        return [
            this._consumerA,
            this._consumerB,
            this._consumerC
        ];
    }
}


// Keep a rolling index of our ScopeSharedServices,
//  so we can prove they are scoped and reused. 
let nextScopeSharedServiceIndex = 1;

@Injectable()
class ScopeSharedServiceImpl implements ScopeSharedService {
    private _id: string;
    
    constructor() {
        this._id = String(nextScopeSharedServiceIndex++);
    }

    getIdentifier(): string {
        return this._id;
    }
}


let nextShareConsumerIndex = 1;

@Injectable()
class ShareConsumerImpl implements ShareConsumer {
    private _id: string;

    constructor(
        @Inject(ScopeSharedService) private _scopedSharedService: ScopeSharedService
    ) {
        this._id = String(nextShareConsumerIndex++);
    }

    getConsumerId(): string {
        return this._id;
    }

    getScopeSharedId(): string {
        return this._scopedSharedService.getIdentifier();
    }
}


export default new ContainerModule(bind => {
    // If the scope identifier is not provided, the binding identifier is used
    //  to identify the scope as well.
    // In this case, it is the equivalent of .asScope(ScopeRootService)
    bind(ScopeRootService).to(ScopeRootServiceImpl).asScope();

    // Specify that we want a new ScopedSharedServiceImpl shared across
    //  requests stemming from every unique ScopeRootService.
    // Two requests in the same ScopeRootService will get the same ScopedSharedService,
    //  while requests in two different ScopeRootServices will get different instances.
    bind(ScopeSharedService).to(ScopeSharedServiceImpl).inScope(ScopeRootService);

    // Bind the share consumer as transient, as we will create multiple of them
    //  under each ScopeRootService to prove the scope mechanism is working.
    bind(ShareConsumer).to(ShareConsumerImpl);
});
