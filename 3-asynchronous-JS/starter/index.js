const fs = require("fs");
const superagent = require(`superagent`);

// PROMISES

const readFilePro = (file) => {
  // resolve function is when promise succecsfull
  // reject is when error is occured
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject(`I could not find that file`);
      resolve(data);
    });
  });
};

// readFilePro(`${__dirname}/dog.txt`).then((data) => {
//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then((res) => {
//       fs.writeFile(`dog-image.txt`, res.body.message, `utf-8`, (err) => {
//         console.log(`Random dog image save to file`);
//       }); // get method returns a promise
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// });

// fs.readFile(`${__dirname}/dog.txt`, `utf-8`, (err, data) => {
//   superagent
//     .get(`https://dog.ceo/api/breed/${data}/images/random`)
//     .then((res) => {
//       fs.writeFile(`dog-image.txt`, res.body.message, `utf-8`, (err) => {
//         console.log(`Random dog image save to file`);
//       }); // get method returns a promise
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// });

// Promises uses when we know that code retrive a data and say to function, hey when you retrive let me know

// async await ------------------------------------
const getDogPic = async () => {
  const data = await readFilePro(`${__dirname}/dog.txt`);
  console.log(`Breead: ${data}`);
  const res = await superagent.get(
    `https://dog.ceo/api/breed/${data}/images/random`
  );
  await fs.writeFileSync(`dog-image.txt`, res.body.message, `utf-8`);
  console.log(`Random dog image save to file`);
};

getDogPic();
