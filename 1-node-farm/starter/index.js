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

// SERVER ____________----------------------______________________
const server = http.createServer((request, response) => {
  console.log(request.url);
  const pathName = request.url;
  if (pathName === `/` || pathName === `/overview`) {
    response.end(`This is the overview`);
  } else if (pathName === `/product`) {
    response.end(`This is the products page`);
  } else {
    response.writeHead(404);

    response.end(`<h1>This page can not be found</h1>`);
  }

  response.end(`Hello from the server`);
});

server.listen(8000, `127.0.0.1`, () => {
  console.log(`Server has been starting and listening to request on port 8000`);
});
