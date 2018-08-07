import { injectable } from "microinject";

import { User } from "../services";

@injectable(User)
export class UserImpl implements User {
  deserialize(userData: any): void {}
}
