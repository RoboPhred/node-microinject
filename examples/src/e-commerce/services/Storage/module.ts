import { ContainerModule } from "microinject";

import { StorageImpl } from "./impl/StorageImpl";

export default new ContainerModule(bind => {
  bind(StorageImpl);
});
