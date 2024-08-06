const http = require("http");
const fs = require("fs");
// const url = require("url");
// đọc dữ liệu từ file data.json
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
/**
 * hàm thây thế các placeholder trong template html
 * @param {*} temp nhận một template html
 * @param {*} product nhận một đối tượng sản phẩm
 * @returns hàm trả về chuổi đã được thây thế các placeholders bằng các giá trị từ đối tượng sản phẩm
 */
const replaceTemplate = (temp, product) => {
  // thây thế các placeholder trong template html thành thuộc tính của đối tượng product
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FORM%}/g, product.form);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  }
  return output;
};
// đọc file templates
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

// chuyển đổi chuổi JSON sang đối tượng JAVASCRIPT
const dataObj = JSON.parse(data);

const server = http.createServer(function (req, res) {
  const pathName = req.url;
  if (pathName === "/" || pathName === "/overview") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    /**
     * tạo html cho từng sản phẩm
     *
     * dataObj: là mảng danh sách đối tượng
     *
     * .map((element) => replaceTemplate(tempCard, element)):sử dụng phương thức map để lập qua từng đối tượng trong mảng dataObj
     * mỗi đối tượng element được truyền vào hàm replaceTemplate((tempCard, element) cùng với chuổi mẫu html hàm sẽ thây thế các placeholders
     * thành các giá trị từ element và trả về chuổi html tương ứng với mỗi sản phẩm
     *
     * join("") dùng để nối tất cả các chuổi thành một chuổi duy nhất
     */
    const cardsHtml = dataObj
      .map((element) => replaceTemplate(tempCard, element))
      .join("");
    /**
     * tempOverview: là chuổi html
     *
     * replace("{%PRODUCT_CARDS%}", cardsHtml); hàm thay thế placeholder {%PRODUCT_CARDS%} trong template 
     * html tempOverview thành cardsHtml
     */
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);
  } else if (pathName === "/products") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    res.end(tempProduct);
  } else if (pathName === "/api") {
    // đọc file data.json
    res.writeHead(200, "Content-Type", "application/json");
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "sasdasdqwe",
    });
    res.end("<h1>Page Not Found</h1>");
  }
});

server.listen(8000, "localhost", () => {
  console.log("listening on port 8000");
});
