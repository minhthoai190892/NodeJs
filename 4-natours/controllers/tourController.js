const fs = require('fs');
// lấy dữ liệu từ file hệ thống và chuyển đổi từ JSON sang OBJECT JAVASCRIPT
const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8')
);
// ! Middleware
// thêm thuộc tính vào đối tượng modeul.exports
exports.checkID = (req, res, next, value) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'not found',
      message: 'Invalid id',
    });
  }
  next();
};
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: tours.length,
    requestTime: req.requestTime,
    data: {
      tours: tours,
    },
  });
};
exports.createTour = (req, res) => {
  //   console.log(req.body);
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
};
exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((element) => element.id === id);
  res.status(200).json({
    status: 'success',

    data: {
      tours: tour,
    },
  });
};
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',

    data: {
      tours: '<Updated tour here ...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',

    data: null,
  });
};
