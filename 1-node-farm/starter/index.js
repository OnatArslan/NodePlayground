const fs = require("fs"); // fs module for file system
const http = require(`http`); // for http server
const url = require("url"); // for url
const slugify = require(`slugify`); // for string changes
const replaceTemplate = require(`./modules/replaceTemplate.js`);

// // Reading files
// // Syncronus vay -- BAD
// const readThis = fs.readFileSync(`./txt/input.txt`, `utf-8`);
// // console.log(readThis);

// // Writing files
// // Syncronus vay -- BAD
// const textOut = `Hey I am using nodeJs outside of the browser`;
// fs.writeFileSync(`./txt/output.txt`, textOut);
// console.log(`File written!!`);

// // Reading files asynchronous way -- GOOD
// // In node js err parameter usually be first parameter
// fs.readFile(`./txt/start.txt`, `utf-8`, (err, data1) => {
//   if (err) return console.log(`ERROR`);
//   fs.readFile(`./txt/${data1}.txt`, `utf-8`, (err, data2) => {
//     fs.writeFile(`./txt/final.txt`, `${data1} ${data2}`, `utf-8`, (err) => {
//       console.log(`Your file has been written`);
//     });
//   });
// });
// console.log(`File is reading...`);

// create constant variables and templates
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, `utf-8`);
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  `utf-8`
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  `utf-8`
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  `utf-8`
);
const dataObjects = JSON.parse(data);

// How work slugify
const slugs = dataObjects.map((el) => {
  return slugify(el.productName, { lower: true });
});
console.log(slugs);
console.log(slugify(`Fresh Avocados`, { lower: true })); //(string, {option1:chose})

// SERVER ____________----------------------______________________
const server = http.createServer((request, response) => {
  const myUrl = new URL(`http://127.0.0.1:8000${request.url}`);
  const { searchParams, pathname: pathName } = myUrl;
  //   Overview page
  if (pathName === `/` || pathName === `/overview`) {
    const cardsHtml = dataObjects.map((el) => {
      return replaceTemplate(tempCard, el);
    });
    const output = tempOverview.replace(`{%PRODUCTS_CARDS%}`, cardsHtml);
    response.end(output);

    // products page
  } else if (pathName === `/product`) {
    const product = dataObjects.find((el) => {
      return el.id === Number(searchParams.get(`id`));
    });
    const output = replaceTemplate(tempProduct, product);
    response.end(output);
    // api
  } else if (pathName === `/api`) {
    response.end(data);
    // not found
  } else {
    response.writeHead(404);

    response.end(`<h1>This page can not be found</h1>`);
  }
});

server.listen(8000, `127.0.0.1`, () => {
  console.log(`Server has been starting and listening to request on port 8000`);
});

// Introduction to npm
