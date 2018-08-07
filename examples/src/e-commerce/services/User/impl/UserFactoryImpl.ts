import { Context, factory } from "microinject";

import uuidV4 from "uuid/v4";

import { Storage } from "../../Storage";

import { UserFactory, User } from "../services";

import { UserImpl } from "./UserImpl";

function userFactoryFactory(context: Context) {
  const storage = context.get(Storage);
  return class implements UserFactory {
    async createUser(): Promise<User> {
      const userId = uuidV4();

      const user = context.create(UserImpl);
      user.init(userId);

      const data = user.serialize();
      const key = this._getStorageKey(userId);
      await storage.set(key, data);
      return user;
    }

    async getUser(userId: string): Promise<User | undefined> {
      const key = this._getStorageKey(userId);
      const data = await storage.get(key);
      if (!data) {
        return undefined;
      }

      const user = context.create(UserImpl);
      user.deserialize(data);
      return user;
    }

    private _getStorageKey(userId: string): string {
      return `user-data::${userId}`;
    }
  };
}

factory(UserFactory)(userFactoryFactory);
export const UserFactoryImpl = userFactoryFactory;
