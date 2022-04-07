class AppError extends Error {
  constructor(message, statusCode) {
    //We inherit the message property from the Error class
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    //Stack trace will show us where the error is happend
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
