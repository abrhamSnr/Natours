const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const rateLimit = require('express-rate-limit');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//To Limit request amount from certain IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api',limiter);

//MiddelWare to read the json
app.use(express.json()); 
app.use(express.static(`${__dirname}/public`));

// app.use((req,res,next) => {   //Creating a middleware
//   console.log('Hello From the Middleware');
//   next(); //Need next when use a middleware
// })

app.use((req, res, next) => {
  req.requstTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);

//If routes does not exist
app.all('*', (req, res, next) => {
  //Send to err handling middleware 
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);

  //The middleware know its error when there is err inside next 
  next(err);
});

//Create Error handling MiddleWare
app.use(globalErrorHandler);

module.exports = app;

//When you delete it's 204 status code and send back data null (We don't need to see the deleted content)
