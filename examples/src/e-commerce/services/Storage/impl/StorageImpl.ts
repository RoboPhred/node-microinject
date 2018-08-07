import { injectable, singleton } from "microinject";

import { Storage } from "../services";

/**
 * A mock storage implementation
 */
@injectable(Storage)
@singleton()
export class StorageImpl implements Storage {
  private _storage = new Map<string, any>();

  get<T>(key: string): Promise<T | undefined> {
    return new Promise(accept => {
      setTimeout(() => {
        accept(this._storage.get(key));
      }, 100);
    });
  }

  set(key: string, value: any): Promise<void> {
    return new Promise(accept => {
      setTimeout(() => {
        this._storage.set(key, value);
        accept();
      });
    });
  }
}
