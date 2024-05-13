const mongoose = require('mongoose');
const dotenv = require('dotenv'); // for config files

dotenv.config({ path: `./config.env` }); // handle the connection
// first set settings and then run server like below

const DB = process.env.DATABASE.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD
);
// Mongoose is a Object Data Modelling libary for MongoDB and Nodejs
// DATABASE CONNECTION
mongoose
  .connect(DB)

  .then(() => {
    console.log(`DB connection succesfull`);
  });

// -------------------------------------------------------------------

const app = require('./app');

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
