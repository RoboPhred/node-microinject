export declare function getSymbol(name: string): symbol;
/**
 * The key used to store the .inScope() binding configuration on an auto-bound object.
 */
export declare const InScopeDecoratorSymbol: symbol;
/**
 * The key used to store the .asScope() binding configuration on an auto-bound object.
 */
export declare const AsScopeDecoratorSymbol: symbol;
/**
 * A placeholder scope value to indicate that the binding should establish the scope
 * identified by the primary identifier of the binding.
 */
export declare const SelfIdentifiedScopeSymbol: symbol;
/**
 * A special scope indicating that the value is a singleton.
 * There is always a single instance of the singleton scope,
 * owned by the top level resolver.
 */
export declare const SingletonScopeSymbol: symbol;
