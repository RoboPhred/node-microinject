import { ContainerModule } from "microinject";

import { UserFactoryImpl } from "./impl/UserFactoryImpl";
import { UserImpl } from "./impl/UserImpl";

export default new ContainerModule(bind => {
  bind(UserFactoryImpl);
  bind(UserImpl);
});
