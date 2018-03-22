
import {
    SingletonSymbol
} from "./symbols";

export function isSingleton(target: any): boolean {
    return target[SingletonSymbol] === true;
}
