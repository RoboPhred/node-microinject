import { Identifier } from "microinject";

export const User: Identifier<User> = "User";
export const UserScope = "User";
export interface User {}

export const UserManager: Identifier<UserManager> = Symbol("UserManager");
export interface UserManager {
  createUser(userId: string): Promise<User>;
  getUser(userId: string): Promise<User | undefined>;
}

export const UserFactory: Identifier<UserFactory> = Symbol("UserFactory");
export interface UserFactory {
  createUser(): Promise<User>;
  getUser(userId: string): Promise<User | undefined>;
}
