const mongoose = require('mongoose');
const slugify = require('slugify');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `a Tour must have a name`], // this is a validator
      unique: true,
      trim: true,
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

// DOCUMENT MIDDLEWARE: RUNS BEFORE .save() and .crate() COMMAND not insertMany()
toursSchema.pre(`save`, function (next) {
  // console.log(this); // this means currently proceded document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// DOCUMENT MIDDLEWARE:RUNS AFTER save() and create()
// post middleware have acces just saved documents
toursSchema.post(`save`, function (doc, next) {
  // console.log(doc);
  next();
});

// creating mongo model
// Use always uppercase for models
const Tour = mongoose.model(`Tour`, toursSchema);

module.exports = Tour;
