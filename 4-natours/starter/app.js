// adding dependencies
const express = require('express');
const morgan = require('morgan');
// importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// create the app
const app = express();

// MIDDLEWARES
// Middleware is a function that can modify the request data

if (process.env.NODE_ENV === `development`) {
  // adding MORGAN middleware
  // morgan middleware log to console request info like below
  app.use(morgan(`dev`)); // GET /api/v1/tours 200 1.123 ms - 8731
}

app.use(express.json()); // adding middleware

// serving static files
app.use(express.static(`${__dirname}/public`));

// Create own middleware function
// This function will run each time our app get request
app.use((req, res, next) => {
  console.log(`Hello from the middleware function`);
  // next() function is mandatory
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// create tours data

app.use(`/api/v1/tours`, tourRouter); // app.use(route, router) middleware and tourRouter connection

app.use(`/api/v1/users`, userRouter);

// ---------------------------------------------------------------------------------------------
//   START THE SERVER
module.exports = app;
