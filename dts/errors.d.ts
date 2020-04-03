import { Identifier } from "./interfaces";
/**
 * Indicates an error that occured while resolving a dependency.
 */
export declare class DependencyResolutionError extends Error {
    /**
     * The error code.
     */
    code: string;
    /**
     * The identifier that failed to resolve.
     */
    identifier: Identifier;
    /**
     * The path from the root requested object to the failing identifier.
     */
    path: Identifier[];
    constructor(identifier: Identifier, path: Identifier[], message?: string);
}
/**
 * Indicates a parameter injection failed to resolve.
 */
export declare class ParameterNotSuppliedError extends Error {
    /**
     * The error code.
     */
    code: string;
    /**
     * The parameter key that failed to resolve.
     */
    paramKey: string | symbol;
    constructor(paramKey: string | symbol, message?: string);
}
