import { composeModules } from "microinject";

import StorageModule from "./services/Storage/module";
import UserModule from "./services/User/module";

export default composeModules(StorageModule, UserModule);
