import { injectable, asScope } from "microinject";

import { User, UserScope } from "../services";

@injectable(User)
@asScope(UserScope)
export class UserImpl implements User {
  init(userId: string) {}
  serialize(): any {}
  deserialize(userData: any): void {}
}
