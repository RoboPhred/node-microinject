/**
 * Indicates an error while performing binding configuration.
 */
export class BindingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BindingConfigurationError.prototype);
    this.message = message;
  }
}
