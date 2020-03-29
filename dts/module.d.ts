import { BindFunction } from "./binder";
export declare class ContainerModule {
    private _binder;
    constructor(_binder: (bind: BindFunction) => void);
    registry(bind: BindFunction): void;
}
/**
 * Composes multiple container modules into a single container module.
 * @param modules The modules to combine.
 */
export declare function composeModules(...modules: ContainerModule[]): ContainerModule;
