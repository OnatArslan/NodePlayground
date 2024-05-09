const fs = require("fs");
const superagent = require(`superagent`);

fs.readFile(`./dog.txt`, `utf-8`, (err, data) => {
  console.log(data);
  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .end((err, res) => {
      if (err) return console.log(err.message);

      console.log(res.body.message);
      fs.writeFile(`dog-image.txt`, res.body.message, `utf-8`, (err) => {
        console.log(`Random dog image save to file`);
      });
    });
});
