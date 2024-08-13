// ! cách 2
const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeature = require('../utils/apiFeature');

exports.aliasTopTours = (req, res, next) => {
  // số lượng hiển thị
  req.query.limit = '5';
  // sort theo -ratingsAverage,price
  req.query.sort = '-ratingsAverage,price';
  // chỉ hiện thị các fields 'name,price,ratingsAverage,summary,difficulty'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //  query
    const feature = new APIFeature(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await feature.query;
    // send response
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
exports.getTourStats = async (req, res) => {
  console.log('asdwqe');

  try {
    const stats =await
      Tour.aggregate([
        { $match: { ratingsAverage: { $gte: 4.5 } } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
          },
        }
      ]);
    res.status(200).json({
      status: 'success',

      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fali',
      message: error.message,
    });
  }
};
// ! cách 1

// const fs = require('fs');
// const Tour = require('../models/tourModel');

// // lấy dữ liệu từ file hệ thống và chuyển đổi từ JSON sang OBJECT JAVASCRIPT
// // const tours = JSON.parse(
// //   fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8')
// // );
// // ! Middleware
// // thêm thuộc tính vào đối tượng modeul.exports
// // exports.checkID = (req, res, next, value) => {
// //   if (req.params.id * 1 > tours.length) {
// //     return res.status(404).json({
// //       status: 'not found',
// //       message: 'Invalid id',
// //     });
// //   }
// //   next();
// // };
// // exports.checkBody = (req, res, next) => {
// //   if (!req.body.name || !req.body.price) {
// //     return res.status(400).json({
// //       status: 'fail',
// //       message: 'Missing name or price',
// //     });
// //   }
// //   next();
// // };
// exports.aliasTopTours = (req, res, next) => {
//   // số lượng hiển thị
//   req.query.limit = '5';
//   // sort theo -ratingsAverage,price
//   req.query.sort = '-ratingsAverage,price';
//   // chỉ hiện thị các fields 'name,price,ratingsAverage,summary,difficulty'
//   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//   next();
// };

// exports.getAllTours = async (req, res) => {
//   console.log("get all tour",req.query);

//   try {
//     // ! 1A.filtering
//     // lấy các query từ url
//     const queryObj = { ...req.query };
//     // tạo mảng loại trừ các trường
//     const excludeFields = ['page', 'sort', 'limit', 'fields'];
//     // loại bỏ các trường đó ra khỏi queryObj
//     excludeFields.forEach((field) => delete queryObj[field]);
//     // const query = Tour.find(queryStr);

//     // {"difficulty":"easy","duration":{"gte":"5"}}
//     // ! 1B.advanced filtering - duration[gte]=5&price[lt]=150
//     // ? tìm giá trị lớn hơn bằng hoặc nhỏ hơn bằng
//     // Chuyển đổi đối tượng thành chuỗi JSON
//     let queryStr = JSON.stringify(queryObj);
//     // Thay thế các toán tử so sánh
//     // \b(gte|gt|lte|lt)\b: Đây là một biểu thức chính quy (regex) tìm kiếm các từ gte, gt, lte, và lt trong chuỗi JSON.
//     /**
//      *  gte: greater than or equal (>=)
//         gt: greater than (>)
//         lte: less than or equal (<=)
//         lt: less than (<)
//      */
//     // (match) => `$${match} thay đổi từ kết quả regex
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     let query = Tour.find(JSON.parse(queryStr));
//     // ! Sorting - { sort: 'price' }
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(',').join(' ');
//       console.log(sortBy);

//       query = query.sort(sortBy);
//     } else {
//       query = query.sort('-createdAt');
//     }

//     // ! field limiting - /tours?fields=name,duration,ratingsAverage,price
//     if (req.query.fields) {
//       const fields = req.query.fields.split(',').join(' ');

//       query = query.select(fields);
//     } else {
//       query = query.select('-__v');
//     }
//     // ! Pagination
//     // tours?page=2&limit=10
//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 100;
//     const skip = (page - 1) * limit;
//     query = query.skip(skip).limit(limit);
//     if (req.query.page) {
//       const numTours = await Tour.countDocuments();
//       if (skip >= numTours) {
//         throw new Error('This page does not exits');
//       }
//     }
//     // thực hiện truy vấn
//     const tours = await query;
//     res.status(200).json({
//       status: 'success',
//       result: tours.length,
//       requestTime: req.requestTime,

//       data: {
//         tours: tours,
//       },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'Fail',
//       message: error.message,
//     });
//   }
// };
// exports.createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'Fali',
//       message: error.message,
//     });
//   }

//   // !làm việc với file json
//   /**
//    *
//   // lấy id
//   const newId = tours[tours.length - 1].id + 1;
//   //   hợp nhất 2 đối tượng lại với nhau
//   const newTour = Object.assign({ id: newId }, req.body);
//   //   thêm tour vào mảng
//   tours.push(newTour);
//   //   ghi lại tất cả các tour vào file
//   //!    JSON.stringify(tours), chuyển đổi đối tượng trong mảng sang JSON
//   fs.writeFile(
//     './dev-data/data/tours-simple.json',
//     JSON.stringify(tours),
//     (error) => {
//       // status(201): created - yêu cầu đã tạo mới thành công
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
//    */
// };
// exports.getTour = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id);
//     res.status(200).json({
//       status: 'success',

//       data: {
//         tours: tour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'Fali',
//       message: error.message,
//     });
//   }
// };
// exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).json({
//       status: 'success',

//       data: {
//         tours: tour,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'Fali',
//       message: error.message,
//     });
//   }
// };

// exports.deleteTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',

//       data: null,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'Fali',
//       message: error.message,
//     });
//   }
// };
