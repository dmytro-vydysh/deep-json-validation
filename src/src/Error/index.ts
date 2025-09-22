/**
 * Generic error class for JSON validation errors.
 */
export class JVError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JVError";
  }
}


/**
 * Error class for key-related errors in JSON validation.
 */
export class JVKeyError extends JVError {
  constructor(message: string) {
    super(message);
    this.name = "JVKeyError";
  }
}

/**
 * Error class for required key errors in JSON validation.
 */
export class JVKeyRequiredError extends JVError {
  constructor(message: string) {
    super(message);
    this.name = "JVKeyRequiredError";
  }
}

/**
 * Error class for key regex validation errors in JSON validation.
 */
export class JVKeyRegexError extends JVError {
  constructor(message: string) {
    super(message);
    this.name = "JVKeyRegexError";
  }
}

/**
 * Error class for key type validation errors in JSON validation.
 */
export class JVKeyTypeError extends JVError {
  constructor(message: string) {
    super(message);
    this.name = "JVKeyTypeError";
  }
}

/**
 * 
 * @param errorInstance the error class to throw
 * @param message the error message to display
 * @param trace the trace of the error, used for error reporting
 * @throws {JVError} Throws an error with the specified message and trace.
 */
export function throwError(errorInstance: typeof JVError, message: string, trace: string): void {
  try {

    /**
     * Throw an error with the specified message and trace.
     */
    throw new errorInstance(`[DEEP JSON VALIDATION] JSON validation failed!\nError: <JVError>${message}</JVError>\nKey address: ${trace}\n`);
  } catch (e) {

    /**
     * There could be a case where the error is not an instance of the expected type so it is necessary to throw the error again and it can be another type of error.
     */
    throw e;
  }
}
