const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');

const app = express();
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}
app.use(express.json()); //MiddelWare to read the json
app.use(express.static(`${__dirname}/public`));
app.use((req,res,next) => {   //Creating a middleware 
  console.log('Hello From the Middleware');
  next(); //Need next when use a middleware 
})
app.use((req,res,next) => {
  req.requstTime = new Date().toISOString();
  next();
})

app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',usersRouter);

module.exports = app;

//When you delete it's 204 status code and send back data null (We don't need to see the deleted content)
