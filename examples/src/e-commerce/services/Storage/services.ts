import { Identifier } from "microinject";

export const Storage: Identifier<Storage> = Symbol("Storage");
export interface Storage {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: any): Promise<void>;
}
