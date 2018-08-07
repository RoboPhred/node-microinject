import { getSymbol as getParentSymbol } from "../symbols";

function getSymbol(id: string) {
  return getParentSymbol(`/injection/${id}`);
}

/**
 * Symbol used as a key to mark a class as being dependency-injectable.
 */
export const ClassIsInjectableKey = getSymbol("InjectableDecorator");

/**
 * Symbol used as a key to contain the array of InjectionData objects
 * corresponding to a class's constructor arguments.
 */
export const ConstructorInjectionsKey = getSymbol(
  "ConstructorInjectionDecorators"
);

/**
 * Symbol used as a key to contain the map of InjectionData objects
 * by object properties.
 */
export const PropertyInjectionsKey = getSymbol("PropertyInjectionsKey");
