import { Identifier } from "microinject";

import { User } from "../User";

export const UserManager: Identifier<UserManager> = Symbol("UserManager");
export interface UserManager {
  getUser(userId: string): Promise<User>;
}
