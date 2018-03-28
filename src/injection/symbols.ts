
import {
    getSymbol as getParentSymbol
} from "../symbols";

function getSymbol(id: string) {
    return getParentSymbol(`/injection/${id}`);
}

/**
 * Symbol used as a key to mark a class as being dependency-injectable.
 */
export const InjectableDecoratorSymbol = getSymbol("InjectableDecorator");

/**
 * Symbol used as a key to contain the array of InjectionData objects
 * corresponding to the class's constructor arguments.
 */
export const ConstructorInjectionDecoratorsSymbol = getSymbol("ConstructorInjectionDecorators");