const fs = require("fs");
// đọc file
const textIn = fs.readFileSync("./txt.txt", "utf-8");
console.log(textIn);
const textOUt = `this is text out file ${textIn}.\n Create on ${Date.now()}`;
fs.writeFileSync("./textOut.txt", textOUt);
