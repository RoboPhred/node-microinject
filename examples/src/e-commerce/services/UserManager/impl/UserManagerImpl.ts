import { injectable, inject, singleton } from "microinject";

import { User } from "../../User";

import { UserManager } from "../services";

@injectable(UserManager)
@singleton()
export class UserManagerImpl implements UserManager {
  getUser(userId: string): Promise<User> {
    throw new Error("Method not implemented.");
  }
}
