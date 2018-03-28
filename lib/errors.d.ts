import { Identifier } from "./interfaces";
export declare class DependencyResolutionError extends Error {
    code: string;
    identifier: Identifier;
    path: Identifier[];
    constructor(identifier: Identifier, path: Identifier[], message?: string);
}
