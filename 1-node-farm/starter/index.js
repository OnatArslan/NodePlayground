const fs = require("fs"); // fs module for file system
const http = require(`http`); // for http server
const url = require("url");

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

const replaceTemplate = (template, product) => {
  let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, `not-organic`);
  }
  return output;
};

// SERVER ____________----------------------______________________
const server = http.createServer((request, response) => {
  console.log(request.url);
  const pathName = request.url;
  //   Overview page
  if (pathName === `/` || pathName === `/overview`) {
    const cardsHtml = dataObjects.map((el) => {
      return replaceTemplate(tempCard, el);
    });
    const output = tempOverview.replace(`{%PRODUCTS_CARDS%}`, cardsHtml);
    console.log(cardsHtml);
    response.end(output);

    // products page
  } else if (pathName === `/product`) {
    response.end(`This is the products page`);
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
