const { model } = require('mongoose');

/**
 * class
 * query: là loại phương thức truy vấn
 *
 * Tour.find()
 *
 * queryString: là chuổi truy vấn (req.query)
 *
 * { difficulty: 'easy' }
 *
 */
class APIFeature {
  constructor(query, queryString) {
    // this.query = Tour.find()
    this.query = query;
    // this.queryString = req.query
    this.queryString = queryString;
  }

  filter() {
    // ! 1A.filtering
    // lấy các query từ url
    const queryObj = { ...this.queryString };
    // tạo mảng loại trừ các trường
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // loại bỏ các trường đó ra khỏi queryObj
    excludeFields.forEach((field) => delete queryObj[field]);
    // const query = Tour.find(queryStr);

    // {"difficulty":"easy","duration":{"gte":"5"}}
    // ! 1B.advanced filtering - duration[gte]=5&price[lt]=150
    // ? tìm giá trị lớn hơn bằng hoặc nhỏ hơn bằng
    // Chuyển đổi đối tượng thành chuỗi JSON
    let queryStr = JSON.stringify(queryObj);
    // Thay thế các toán tử so sánh
    // \b(gte|gt|lte|lt)\b: Đây là một biểu thức chính quy (regex) tìm kiếm các từ gte, gt, lte, và lt trong chuỗi JSON.
    /**
       *  gte: greater than or equal (>=)
          gt: greater than (>)
          lte: less than or equal (<=)
          lt: less than (<)
       */
    // (match) => `$${match} thay đổi từ kết quả regex
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // ! Sorting - { sort: 'price' }
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  // ! field limiting - /tours?fields=name,duration,ratingsAverage,price
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }
  paginate() {
    // ! Pagination
    // tours?page=2&limit=10
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) {
    //     throw new Error('This page does not exits');
    //   }
    // }
    return this;
  }
}

module.exports = APIFeature;
