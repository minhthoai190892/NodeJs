const fs = require('fs');
const Tour = require('../models/tourModel');

// lấy dữ liệu từ file hệ thống và chuyển đổi từ JSON sang OBJECT JAVASCRIPT
// const tours = JSON.parse(
//   fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8')
// );
// ! Middleware
// thêm thuộc tính vào đối tượng modeul.exports
// exports.checkID = (req, res, next, value) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'not found',
//       message: 'Invalid id',
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };
exports.getAllTours = async (req, res) => {
  try {
    // ! 1A.filtering
    // lấy các query từ url
    const queryObj = { ...req.query };
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

    let query = Tour.find(JSON.parse(queryStr));
    // ! Sorting - { sort: 'price' }
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);

      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    // thực hiện truy vấn
    const tours = await query;
    res.status(200).json({
      status: 'success',
      result: tours.length,
      requestTime: req.requestTime,

      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Fail',
      message: error.message,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fali',
      message: error.message,
    });
  }

  // !làm việc với file json
  /**
   * 
  // lấy id
  const newId = tours[tours.length - 1].id + 1;
  //   hợp nhất 2 đối tượng lại với nhau
  const newTour = Object.assign({ id: newId }, req.body);
  //   thêm tour vào mảng
  tours.push(newTour);
  //   ghi lại tất cả các tour vào file
  //!    JSON.stringify(tours), chuyển đổi đối tượng trong mảng sang JSON
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (error) => {
      // status(201): created - yêu cầu đã tạo mới thành công
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
   */
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',

      data: {
        tours: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fali',
      message: error.message,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',

      data: {
        tours: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fali',
      message: error.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',

      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fali',
      message: error.message,
    });
  }
};
