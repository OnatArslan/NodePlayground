const dotenv = require('dotenv'); // for config files

dotenv.config({ path: `./config.env` }); // baglantiyi kurduk
// first set settings and then run server like below
const app = require('./app');

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
