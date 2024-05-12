const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, `utf-8`)
);

// We export it to tourRoutes and check if id legit or not
exports.checkId = (req, res, next, val) => {
  console.log(`Tour id is ${val}`);
  if (Number(req.params.id) >= tours.length) {
    return res.status(404).json({
      status: `fail`,
      message: `Invalid ID`,
    });
  }
  next();
};

// Create a checkBody middleware function
// Check if body contains the name and price property
// If not, send 400 (bad request) response
// Add it to the post handler stack
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: `fail`,
      message: `Body or price is null`,
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: `success`,
    requestAt: req.requestTime,
    data: {
      tours: tours, // we use data as object because of abstraction
    },
  });
};

// Route for getting 1 tour
// :id is our selector for finding that tour
exports.getOneTour = (req, res) => {
  const tour = tours.find((el) => {
    // req.params will hold :id/:x/:y variables which id : `3` as a string
    return el.id === Number(req.params.id);
  });

  res.status(200).json({
    status: `success`,
    data: {
      tour: tour,
    },
  });
};

// When we post data the server request object will keep that data and we can recieve on request object
// for modidfy the request object we must use middleware (line 3 - 8)
exports.createTour = (req, res) => {
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
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: `success`,
    data: {
      tour: `Updated tour here...`,
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: `success`,
    data: null,
  });
};
