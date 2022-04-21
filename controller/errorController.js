const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //Log error
    console.error('Error >>>>>> ', err);
    //Send generate message
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  //This will show the error display
  //Which will be send from the error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;

    //Invalid Database IDs
    if (error.name === 'CastError') {
      const message = `Invalid ${error.path}: ${error.value},`;
      error = new AppError(message, 400);
    }

    //Duplicate value error
    if (error.code === 11000) {
      const message = `Duplicate field value: ${error.keyValue.name}, Please use another value`;
      error = new AppError(message, 400);
    }

    //Valdiation error
    if (error.name === 'ValidationError') {
      error = new AppError(err.message, 400);
    }

    if (error.name === 'JsonWebTokenError') {
      error = new AppError('Invalid Token. Please log in again', 401);
    }

    if (error.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired, please login again', 401);
    }

    sendErrorProd(error, res);
  }
};
