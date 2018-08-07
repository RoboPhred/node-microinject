import { Context, factory } from "microinject";

import { Storage } from "../../Storage";

import { UserFactory, User } from "../services";

import { UserImpl } from "./UserImpl";

function userFactoryFactory(context: Context) {
  const storage = context.get(Storage);
  return function getUser(userId: string) {
    const data = storage.get(`user-data::${userId}`);
    // TODO: Need something like context.create(UserImpl, ...ctorParams)
    const user = context.get(User);
    (user as UserImpl).deserialize(data);
    return user;
  };
}
factory(UserFactory)(userFactoryFactory);
export const UserFactoryImpl = userFactoryFactory;
