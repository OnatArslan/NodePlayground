// adding dependencies
const express = require('express');
const morgan = require('morgan');
// importing routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
// Import ErrorClass
const AppError = require(`./utils/appError`);
const wrongRoute = require(`./controllers/errorController`);
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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// create tours data

app.use(`/api/v1/tours`, tourRouter); // app.use(route, router) middleware and tourRouter connection
app.use(`/api/v1/users`, userRouter);

// We need put this unhanled request middleware after the original router because when they can't catch (true request) this will catch wrong request
app.all(`*`, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); // whenewer we give argument to next() function express will understand a error hapening and jump to error handler middleware
});

// Error handler middleware first parameter is err and then normal middleware function
app.use(wrongRoute);

// ---------------------------------------------------------------------------------------------
//   START THE SERVER
module.exports = app;
