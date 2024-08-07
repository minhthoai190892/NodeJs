/**
 * hàm thây thế các placeholder trong template html
 * @param {*} temp nhận một template html
 * @param {*} product nhận một đối tượng sản phẩm
 * @returns hàm trả về chuổi đã được thây thế các placeholders bằng các giá trị từ đối tượng sản phẩm
 */
module.exports = (temp, product) => {
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
