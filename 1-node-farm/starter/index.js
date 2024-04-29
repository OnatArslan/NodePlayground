const fs = require("fs");

const textIn = fs.readFileSync(`./txt/input.txt`, `utf-8`);
const textOut = `This is what we know about avocado ${textIn}.\nCreated on ${Date.now()}`;

fs.writeFileSync(`./txt/output.txt`, textOut);
console.log(`file written`);
