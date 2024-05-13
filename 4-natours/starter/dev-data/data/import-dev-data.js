const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require(`./../../models/tourModel`);

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.DATABASE.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log(`Db connection is succesfull`));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, `utf-8`)
);

// IMPORT DATA TO DATABASE
const importData = async () => {
  try {
    // create method can accept array of documents
    await Tour.create(tours);
    console.log(`Data succesfuly loaded to DB`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete Data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log(`Data succesfuly deleted`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === `--import`) {
  importData();
} else if (process.argv[2] === `--delete`) {
  deleteData();
}

console.log(process.argv);
