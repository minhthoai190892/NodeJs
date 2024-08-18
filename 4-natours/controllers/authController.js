const { promisify } = require('util');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
/**
 * hàm để tạo một JWT cho người dùng khi họ đăng ký hoặc đăng nhập
 * @param {*} id - tham số id của người dùng thường là id từ mongodb
 * @returns trả về chuổi mã hóa id
 */
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};
/**
 * hàm tạo mới User
 *
 */
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // ! kiểm tra email và password có tồn tại
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // ! kiểm tra user tồn tại và password có đúng không
  const user = await User.findOne({ email: email }).select('+password');
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // ! nếu tất cả đúng thì gửi kết quả
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // nhận mã token và kiểm tra
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // xác nhận mã token
  /**
   * Dòng mã này giải mã token và kiểm tra tính hợp lệ của nó bằng cách sử dụng khóa bí mật (JWT_SECRET)
   * promisify - hàm từ thư viện util để chuyển đổi hàm jwt.verify thành một hàm trả về Promise
   * jwt.verify - Hàm jwt.verify từ thư viện jsonwebtoken được sử dụng để giải mã và
   * xác minh tính hợp lệ của một JWT. Nó kiểm tra xem token có hợp lệ và chưa hết hạn hay không dựa trên khóa bí mật (JWT_SECRET).
   *
   */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log('decoded',decoded);

  // kiểm tra user có còn tồn tại hay không

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The token belonging to this token user does no longer exist.',
        401
      )
    );
  }
  // kiểm tra user có thay đổi password sau khi mã thông báo đã được phát hành hay không
  console.log(currentUser.changedPasswordAfter(decoded.iat));

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401)
    );
  }
  // cấp quyền truy cập vào tuyến đường được bảo vệ
  req.user = currentUser;
  next();
});
