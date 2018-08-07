import { ContainerModule } from "microinject";

import { UserManagerImpl } from "./impl/UserManagerImpl";
import { UserFactoryImpl } from "./impl/UserFactoryImpl";
import { UserImpl } from "./impl/UserImpl";

export default new ContainerModule(bind => {
  bind(UserManagerImpl);
  bind(UserFactoryImpl);
  bind(UserImpl);
});
