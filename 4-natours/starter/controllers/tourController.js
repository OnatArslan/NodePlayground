const Tour = require(`./../models/tourModel`);

// We export it to tourRoutes and check if id legit or not
// exports.checkId = (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);
//   if (Number(req.params.id) >= tours.length) {
//     return res.status(404).json({
//       status: `fail`,
//       message: `Invalid ID`,
//     });
//   }
//   next();
// };

// Create a checkBody middleware function
// Check if body contains the name and price property
// If not, send 400 (bad request) response
// Add it to the post handler stack
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: `fail`,
//       message: `Body or price is null`,
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  // find() method without parameter(filter, projection, options) return all Tours
  // Tour.find(filter, projection, options)
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: `success`,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

// Route for getting 1 tour
// :id is our selector for finding that tour
exports.getOneTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    // const tour = await Tour.findOne({ name: req.params.id }); we can use findOne method like that
    if (tour) {
      res.status(200).json({
        status: `success`,
        data: {
          tour: tour,
        },
      });
    } else {
      res.status(404).json({
        status: `failed`,
        message: `Id is not match`,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

// When we post data the server request object will keep that data and we can recieve on request object
// for modidfy the request object we must use middleware (line 3 - 8)
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: `success`,
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

// How to handle patch requests
exports.updateTour = async (req, res) => {
  try {
    // const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body);

    // This is same findByIdAndUpdate() function
    const updatedTour = await Tour.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true, // this option means return updated tour to updatedTour object and when responsing that data we get updated version of tour
        runValidators: true, // this option for validate new tour and then save it
      }
    );

    res.status(200).json({
      status: `success`,
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete({ _id: req.params.id });
    // Or same like
    // await Tour.findOneAndDelete({_id:req.params/id}) I write this for all functions because if we want a object based on name etc. must use findOne(function)

    res.status(204).json({
      // 204 is for deleting response code
      status: `success`,
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: `failed`,
      message: err,
    });
  }
};
