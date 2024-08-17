const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

/*
    exports là một tham chiếu ban đầu đến module.exports.
Điều này có nghĩa là khi bạn thêm các thuộc tính hoặc phương thức vào exports, bạn thực sự đang thêm chúng vào đối tượng module.exports.
*/

exports.getAlluUsers = catchAsync(async (req, res, next) => {
  const users =await User.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    requestTime: req.requestTime,

    data: {
      users: users,
    },
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route  is not yet defined',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route  is not yet defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route  is not yet defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route  is not yet defined',
  });
};
