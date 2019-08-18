import { AutoBindAsScopeKey, AutoBindInScopeKey } from "./symbols";

import { Scope } from "./interfaces";

export function getInScope(target: any): Scope {
  return target[AutoBindInScopeKey];
}

export function getAsScope(target: any): Scope {
  return target[AutoBindAsScopeKey];
}
