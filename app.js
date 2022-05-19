const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// ( THIS IS FOR SECURITY PURPOSE ) Set security for HTTP headres
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ( THIS IS FOR SECURITY PURPOSE ) To Limit request amount from certain IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//MiddelWare to read the json, reading data from body into req.body, the body parser wont accept a body larger than 10kb
app.use(express.json({ limit: '10kb' }));

// ( THIS IS FOR SECURITY PURPOSE ), Data sanitization against NoSQL query injection, should be after body parser
app.use(mongoSanitize());

// ( THIS IS FOR SECURITY PURPOSE ), Data sanitization aginst XSS, injucted melicious code using HTML and JS
app.use(xss());

// ( THIS IS FOR SECURITY PURPOSE ) Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// app.use((req,res,next) => {   //Creating a middleware
//   console.log('Hello From the Middleware');
//   next(); //Need next when use a middleware
// })

//Test middleware
app.use((req, res, next) => {
  req.requstTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);

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
