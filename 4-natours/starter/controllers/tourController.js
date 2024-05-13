const Tour = require(`./../models/tourModel`);

exports.getAllTours = async (req, res) => {
  // find() method without parameter(filter, projection, options) return all Tours
  // Tour.find(filter, projection, options)
  try {
    // get copy of req.query
    // 1-A) FILTERING --------------------------------
    queryObj = { ...req.query };
    console.log(req.query);
    // define special queries
    specialQueries = [`page`, `sort`, `limit`, `fields`];
    // remove special queries in queryObj if there
    specialQueries.forEach((element) => {
      delete queryObj[element];
    });

    // define query like this because Tour.find() function return a query (this is not await)
    // we can't declare tours here with await because we may need pagination or sorting and we use that functions on query object
    // End of process we define tours = await query
    // 1-B) ADVANCED FILTERING --------------------------------
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    console.log(JSON.parse(queryString));
    // How does the filter object look like { difficulty:`easy`, duration:{ $gte: 5} }
    // { duration: { gte: '5' } }
    // gte, gt, lte, lt
    let query = Tour.find(JSON.parse(queryString));

    // 3 SORTING --------------------
    if (req.query.sort) {
      // sort() method work like this sort(`Sortby1` `Sortyby2`) but req.url is sort=Sortby1,Sortby2
      // because of that split(`,`) and then join(` `) make confortable with mongoDB syntax
      const sortBy = req.query.sort.split(`,`).join(` `); // we join with ` ` because mongodb will accept like that
      console.log(sortBy); // -> difficulty price this is legit syntax for mongoDb sort
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // End of process

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
