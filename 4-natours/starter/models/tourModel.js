const mongoose = require('mongoose');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `a Tour must have a name`], // this is a validator
      unique: true,
      trim: true,
      maxlenght: [40, `A tour name must have less than 40 characters`],
      minlenght: [10, `A tour name must have more than 10 characters`],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, `A tour must have duration`],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `A tour must have a group size`],
    },
    difficulty: {
      type: String,
      required: [true, `A tour must have a difficulty`],
    },
    ratingsAvarage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, `A tour must have a price`],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, `A tour must have summary`],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, `A tour must have a cover image`],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // we cannot select the field with query this is usefull for hiding the data from the client
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Because of we use this keyword we can't use arror function, we must use regular function
// We can not use query based on virtuals like durationWeeks because this is not belong to database, durationWeeks only created when we get() them
toursSchema.virtual(`durationWeeks`).get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: RUNS BEFORE .save() and .crate() COMMAND not insertMany()-------------------------------------
toursSchema.pre(`save`, function (next) {
  // console.log(this); // this means currently proceded document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// DOCUMENT MIDDLEWARE:RUNS AFTER save() and create()
// post middleware have acces just saved documents
// toursSchema.post(`save`, function (doc, next) {
// console.log(doc);
// next();
// });

// QUERY MIDDLEWARE PRE -----------------------------------
// toursSchema.pre(`find`, function (next) {
toursSchema.pre(/^find/, function (next) {
  // console.log(this);  this keyword refer to query Object
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// post Middleware's have accest to document because its is working right after document is processed
toursSchema.post(/^find/, function (docs, next) {
  // console.log(this);  this keyword refer to query Object
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE FOR BEFORE AGGREGATION IS START pre() -----------------------------------
toursSchema.pre(`aggregate`, function (next) {
  // console.log(this);  this refer to aggregate object
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());

  next();
});

// creating mongo model
// Use always uppercase for models
const Tour = mongoose.model(`Tour`, toursSchema);

module.exports = Tour;
