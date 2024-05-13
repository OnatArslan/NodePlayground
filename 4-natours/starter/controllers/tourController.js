const Tour = require(`./../models/tourModel`);

exports.getAllTours = async (req, res) => {
  // find() method without parameter(filter, projection, options) return all Tours
  // Tour.find(filter, projection, options)
  try {
    // FIRST WE BUILD THE QUERY
    // declera query object copy
    const queryObj = { ...req.query };
    // give which queries not included in queryObj
    const excludedFields = [`page`, `sort`, `limit`, `fields`];
    // delete excluded fields in queryObj
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });
    console.log(req.query, queryObj);
    // FIRST WAY OF WRITING QUERY WITH MONGODB QUERIES
    // And filter tours by new(excluded fieldslardan arinmis) queryObj

    const query = Tour.find(queryObj);

    // SECOND WAY OF WRITING QUERIES WITH MONGOOSE METHOD CHANING
    // const query =  Tour.find()
    //   .where(`duration`)
    //   .equals(5)
    //   .where(`difficulty`)
    //   .equals(`easy`);

    // EXECUTE THE QUERY
    const tours = await query;

    // SEND RESPONSE
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
