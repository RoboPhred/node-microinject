
import {
    getSymbol as getParentSymbol
} from "../symbols";

export function getSymbol(name: string) {
    return getParentSymbol(`/scope/${name}`);
}

/**
 * The key used to store the .inScope() binding configuration on an auto-bound object.
 */
export const InScopeDecoratorSymbol = getSymbol("InScope");

/**
 * The key used to store the .asScope() binding configuration on an auto-bound object.
 */
export const AsScopeDecoratorSymbol = getSymbol("AsScope");

/**
 * A placeholder scope value to indicate that the binding should establish the scope
 * identified by the primary identifier of the binding.
 */
export const SelfIdentifiedScopeSymbol = getSymbol("AsScopeSelfIdentified");

/**
 * A special scope indicating that the value is a singleton.
 * There is always a single instance of the singleton scope,
 * owned by the top level resolver.
 */
export const SingletonScopeSymbol = getSymbol("SingletonScope");