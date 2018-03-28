
import {
    Identifier
} from "./interfaces";

import {
    identifierToString
} from "./utils";


export class DependencyResolutionError extends Error {
    public code: string;
    public identifier: Identifier;
    public path: Identifier[];

    constructor(identifier: Identifier, path: Identifier[], message?: string) {
        message = `Failed to resolve value for identifier "${identifierToString(identifier)}"${message ? ":" + message : "."}`;
        super(message);
        Object.setPrototypeOf(this, DependencyResolutionError.prototype);
        this.identifier = identifier;
        this.path = path;
        this.message = message;
        this.name = "DependencyResolutionError";
        this.code = "DEPENDENCY_RESOLUTION_FAILED";
    }
}