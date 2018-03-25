"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const microinject_1 = require("microinject");
exports.ServiceLocator = Symbol("ServiceLocator");
function serviceLocatorFactory(context) {
    // Note that we make a new locator every time we are asked.
    //  This is because each invocation of serviceLocatorFactor can
    //  potentially have a new set of scopes, and we want to support scoping here.
    // If we cached the first instance, then the ServiceLocator would act
    //  as a singleton under the scope it was created for, and only resolve
    //  services from that scoping.
    return new ServiceLocatorImpl(context);
}
class ServiceLocatorImpl {
    constructor(_context) {
        this._context = _context;
    }
    get(identifier) {
        // NOTE: Requiring the user to pass scopes around is a Bad Thing.
        //  It is easy to forget or corrupt.
        // TODO: Refactor Container so that scope is kept internally,
        //  probably by passing wrappers to Container through context.
        return this._context.container.get(identifier, this._context.scopes);
    }
}
exports.default = new microinject_1.ContainerModule(bind => {
    // We have to use a transient scope if we want ServiceLocator to work in the scope
    //  of whatever asks for it.  See notes in serviceLocatorFactory.
    bind(exports.ServiceLocator).toDynamicValue(serviceLocatorFactory).inTransientScope();
});
//# sourceMappingURL=service-locator.js.map