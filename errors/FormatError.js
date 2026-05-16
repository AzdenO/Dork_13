export default class FormatError extends Error {
    constructor(message) {
        super();
        this.message=message
        this.code = "FORMAT_ERROR";
        Error.captureStackTrace(this, this.constructor);

    }
}