import { Scope } from "./interfaces";
export declare function Singleton<TFunction extends Function>(): (target: TFunction) => void;
export declare function InScope<TFunction extends Function>(scope: Scope): (target: TFunction) => void;
/**
 * Specify that this object creates a new named scope.
 * @param scope The optional scope identifier to identify the scope created by this object.  If unset, the object will be identified by the identifier of the object.
 */
export declare function AsScope<TFunction extends Function>(scope?: Scope): (target: TFunction) => void;
