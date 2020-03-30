import { BindFunction } from "./binder";
import { RegistryBinder } from "./interfaces";

export class ContainerModule implements RegistryBinder {
  constructor(private _binder: (bind: BindFunction) => void) {}

  registry(bind: BindFunction): void {
    this._binder(bind);
  }
}

/**
 * Composes multiple container modules into a single container module.
 * @param modules The modules to combine.
 */
export function composeModules(...modules: ContainerModule[]): ContainerModule {
  return new ContainerModule(bind => {
    modules.forEach(x => x.registry(bind));
  });
}
