import { Identifier } from "microinject";

export const User: Identifier<User> = "User";
export const UserScope = "User";
export interface User {}

export const UserFactory: Identifier<UserFactory> = Symbol("UserFactory");
export interface UserFactory {
  (userId: string): User;
}
