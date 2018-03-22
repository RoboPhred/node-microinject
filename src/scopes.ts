
import {
    SingletonSymbol
} from "./symbols";

export function singleton<TFunction extends Function>(): (target: TFunction) => void {
    return function(target: any) {
        target[SingletonSymbol] = true;
    }
}
