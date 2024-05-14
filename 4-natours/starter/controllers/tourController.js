const Tour = require(`./../models/tourModel`);
const APIFeatures = require(`./../utils/apiFeatures`);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = `5`;
  req.query.sort = `-ratingsAvarage,price`;
  req.query.fields = `name,price,ratingsAvarage,summary,difficulty`;
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // All the and we assign query to data object and response.Bunu yapma sebebimiz once tum isleri query uzerinde yapip en son data halini response donmemiz
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: `success`,
      count: tours.length,
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

// AGGREGATION PIPELINE
// This function is used to get statistics about tours.
// It uses MongoDB's aggregation framework to perform complex data processing tasks.
exports.getTourStats = async (req, res) => {
  try {
    // The aggregate function is used on the Tour model to perform operations on the data.
    const stats = await Tour.aggregate([
      {
        // The $match stage is used to filter the documents.
        // Only the documents that match the specified condition(s) are passed to the next pipeline stage.
        // In this case, it's filtering tours that have an average rating of 4.5 or higher.
        $match: { ratingsAvarage: { $gte: 4.5 } },
      },
      {
        // The $group stage is used to group input documents by the specified _id expression.
        // For each distinct grouping, it outputs a document.
        // The _id field of each output document contains the unique group by value.
        // In this case, it's grouping all the tours by difficulty.
        $group: {
          _id: { $toUpper: `$difficulty` },

          // The $sum operator is used to total the number of documents (tours) in each group.
          numTours: { $sum: 1 },

          // The $sum operator is also used to add up the values of `ratingsQuantity` field in each group.
          numRatings: { $sum: `$ratingsQuantity` },

          // The $avg operator is used to calculate the average `ratingsAvarage` field in each group.
          avgRating: { $avg: `$ratingsAvarage` },

          // The $avg operator is used to calculate the average `price` field in each group.
          avgPrice: { $avg: `$price` },

          // The $min operator is used to get the minimum `price` field in each group.
          minPrice: { $min: `$price` },

          // The $max operator is used to get the maximum `price` field in each group.
          maxPrice: { $max: `$price` },
        },
      },
      {
        // The $sort stage is used to sort the documents.
        // In this case, it's sorting the documents by average price in ascending order.
        $sort: { avgPrice: 1 },
      },
      {
        // The $match stage is used again to filter the documents.
        // In this case, it's filtering out the tours that have a difficulty of 'EASY'.
        $match: { _id: { $ne: `EASY` } },
      },
    ]);
    // Send a response with a status of 200 (OK) and a JSON body containing the status and the calculated stats.

    res.status(200).json({
      status: `success`,
      data: {
        stats: stats,
      },
    });
  } catch (err) {
    // If there's an error, send a response with a status of 404 (Not Found) and a JSON body containing the status and the error message.
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = Number(req.params.year);

    const plan = await Tour.aggregate([
      {
        // Toplamda 9 turumuz var ve her biri yilda 3 kere yapiliyor $unwind oper. yaptigi her bir date icin turu tekrar atmak yani artik 27 tane datamiz oldu
        $unwind: `$startDates`, // after this we have 3 Forest Hiker (actually 1 tour for each data)
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: `$startDates` },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: `success`,
      data: {
        plan: plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: `failed`,
      message: `err`,
    });
  }
};
