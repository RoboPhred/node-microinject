import { Scope } from "./interfaces";
export declare function Singleton<TFunction extends Function>(): (target: TFunction) => void;
export declare function InScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void;
export declare function AsScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void;
