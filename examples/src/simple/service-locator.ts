import { Context, Identifier, Container, ContainerModule } from "microinject";

// While some argue that a ServiceLocator is an anti-pattern (and superceded by factories),
//  it can be reproduced in this form.
// Note the signature of ServiceLocator.get().  This is what allows typescript to look up
//  the type of your service from an identifier typed with Identifier<T>.
export interface ServiceLocator {
  get<T>(identifier: Identifier<T>): T;
}
export const ServiceLocator = Symbol("ServiceLocator") as Identifier<
  ServiceLocator
>;

function serviceLocatorFactory(context: Context) {
  // Note that we make a new locator every time we are asked.
  //  This is because each invocation of serviceLocatorFactor can
  //  potentially have a new set of scopes, and we want to support scoping here.
  // If we cached the first instance, then the ServiceLocator would act
  //  as a singleton under the scope it was created for, and only resolve
  //  services from that scoping.
  return new ServiceLocatorImpl(context);
}

class ServiceLocatorImpl implements ServiceLocator {
  constructor(private _context: Context) {}

  get<T>(identifier: Identifier<T>): T {
    // Important note: We need to use context.get() in order
    //  to support scoped bindings.
    // context.container is the root container and has no concept
    //  of scope, so context.container.get() will not be aware of any scope
    //  that this ServiceLocator was requested in.
    return this._context.get(identifier);
  }
}

export default new ContainerModule(bind => {
  // We have to use a transient scope if we want ServiceLocator to work in the scope
  //  of whatever asks for it.  See notes in serviceLocatorFactory.
  // Note that transient scope is always the default.  It is explicitly used here
  //  to call attention to the issue.
  bind(ServiceLocator)
    .toFactory(serviceLocatorFactory)
    .inTransientScope();
});
