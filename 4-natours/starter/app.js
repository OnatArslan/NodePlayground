// adding dependencies
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

// create the app
const app = express();

// MIDDLEWARES
// Middleware is a function that can modify the request data

// adding MORGAN middleware
// morgan middleware log to console request info like below
app.use(morgan(`dev`)); // GET /api/v1/tours 200 1.123 ms - 8731
//
app.use(express.json()); // adding middleware

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
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, `utf-8`)
);

// always callback(request, response)
// ROUTE HANDLERS ---------------------------
// Tour raoute handlers
const getAllTours = (req, res) => {
  res.status(200).json({
    status: `success`,
    requestAt: req.requestTime,
    // we use data as object because of abstraction
    data: {
      tours: tours,
    },
  });
};

// Route for getting 1 tour
// :id is our selector for finding that tour
const getOneTour = (req, res) => {
  const tour = tours.find((el) => {
    // req.params will hold :id/:x/:y variables which id : `3` as a string
    return el.id === Number(req.params.id);
  });

  if (Number(req.params.id > tours.length)) {
    return res.status(404).json({
      status: `fail`,
      message: `Invalid id`,
    });
  }

  res.status(200).json({
    status: `success`,
    data: {
      tour: tour,
    },
  });
};

// When we post data the server request object will keep that data and we can recieve on request object
// for modidfy the request object we must use middleware (line 3 - 8)
const createTour = (req, res) => {
  console.log(req.body);
  const newId = tours.at(-1).id + 1;
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: `success`,
        data: {
          tour: newTour,
        },
      });
    }
  );
};

// How to handle patch requests
const updateTour = (req, res) => {
  res.status(200).json({
    status: `success`,
    data: {
      tour: `Updated tour here...`,
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: `success`,
    data: null,
  });
};

// Users route handlers
const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: `err`, message: `This route is not yet defined` });
};

const getOneUser = (req, res) => {
  res
    .status(500)
    .json({ status: `err`, message: `This route is not yet defined` });
};
const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: `err`, message: `This route is not yet defined` });
};

const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: `err`, message: `This route is not yet defined` });
};

const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: `err`, message: `This route is not yet defined` });
};

// Routers
// app.get(`/api/v1/tours`, getAllTours);
// app.get(`/api/v1/tours/:id`, getOneTour);
// app.post(`/api/v1/tours`, createTour);
// app.patch(`/api/v1/tours/:id`, updateTour);
// app.delete(`/api/v1/tours/:id`, deleteTour);

// ROUTES
// We create routers for each app (tours, users, messages, ...)
const tourRouter = express.Router();
app.use(`/api/v1/tours`, tourRouter);

tourRouter.route(`/api/v1/tours`).get(getAllTours).post(createTour);
tourRouter.route(`/:id`).get(getOneTour).patch(updateTour).delete(deleteTour);

const usersRouter = express.Router();
app.use(`/api/v1/users`, usersRouter);

app.route(`/`).get(getAllUsers).post(createUser);
app.route(`/:id`).get(getOneUser).patch(updateUser).delete(deleteUser);

//   START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
