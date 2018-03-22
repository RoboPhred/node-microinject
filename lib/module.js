"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContainerModule {
    constructor(_binder) {
        this._binder = _binder;
    }
    registry(bind) {
        this._binder(bind);
    }
}
exports.ContainerModule = ContainerModule;
/**
 * Composes multiple container modules into a single container module.
 * @param modules The modules to combine.
 */
function composeModules(...modules) {
    return new ContainerModule(bind => {
        modules.forEach(x => x.registry(bind));
    });
}
exports.composeModules = composeModules;
