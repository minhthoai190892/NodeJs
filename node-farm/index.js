const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const replaceTemplate = require("./modules/replaceTemplate");
const slugify = require("slugify");
// đọc dữ liệu từ file data.json
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");

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

const slugs = dataObj.map((element) => slugify(element.productName,{lower:true}));
console.log(slugs);

const server = http.createServer(function (req, res) {
  // const pathname = req.url;
  const { query, pathname } = url.parse(req.url);
  // const query1 = querystring.parse(query);
  // const queryParams = Object.assign({}, query1);
  // console.log(queryParams.id);

  if (pathname === "/" || pathname === "/overview") {
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
  } else if (pathname === "/product") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    // trích xuất query parameters từ URL
    const query1 = querystring.parse(query);
    // chuyển đổi đối tượng query sang một đối tượng bình thường
    const queryParams = Object.assign({}, query1);
    // truy xuất sản phẩm từ dataObj bằng id
    const product = dataObj[queryParams.id];
    // thây thế các placeholder trong template html thành thuộc tính của đối tượng product
    const output = replaceTemplate(tempProduct, product);
    // chuyển đổi sang JSON
    // const testJson = JSON.stringify(product);
    // console.log(output);

    res.end(output);
  } else if (pathname === "/api") {
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
