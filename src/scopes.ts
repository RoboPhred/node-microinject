
import {
    SingletonSymbol
} from "./symbols";

export function Singleton<TFunction extends Function>(): (target: TFunction) => void {
    return function(target: any) {
        target[SingletonSymbol] = true;
    }
}
