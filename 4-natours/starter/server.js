const mongoose = require('mongoose');
const dotenv = require('dotenv'); // for config files

dotenv.config({ path: `./config.env` }); // baglantiyi kurduk
// first set settings and then run server like below

const DB = process.env.DATABASE.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD
);
// Mongoose is a Object Data Modelling libary for MongoDB and Nodejs
// setting Databese connection
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })

  .then(() => {
    console.log(`DB connection succesfull`);
  });

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `A tour must have a name`],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, `A tour must have a price`],
  },
});

const Tour = mongoose.model(`Tour`, toursSchema);

const app = require('./app');

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
