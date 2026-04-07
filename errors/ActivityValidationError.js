export default class ActivityValidationError extends Error {
    constructor(message,code) {
        super();
        this.message=message
        this.code = code;
        Error.captureStackTrace(this, this.constructor);

    }
}