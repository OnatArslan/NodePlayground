const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `a Tour must have a name`], // this is a validator
    unique: true,
    trim: true,
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
});

// creating mongo model
// Use always uppercase for models
const Tour = mongoose.model(`Tour`, toursSchema);

module.exports = Tour;
