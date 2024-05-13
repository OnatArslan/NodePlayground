const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Tour must have a name`], // this is a validator
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, `Tour must have a price`],
  },
});
// creating mongo model
// Use always uppercase for models
const Tour = mongoose.model(`Tour`, toursSchema);

module.exports = Tour;
