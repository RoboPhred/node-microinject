
export class IdentifierNotBoundError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, IdentifierNotBoundError.prototype);
        this.message = message;
    }
}

export class BindingConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, BindingConfigurationError.prototype);
        this.message = message;
    }
}
