const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
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
/**
 * Phương thức kiểm tra role của người dùng
 * @param  {...any} roles - nhận danh sách role
 * @returns
 */
exports.restricTo = (...roles) => {
  return (req, res, next) => {
    // roles = ['admin', 'lead-guide'] role = 'user'
    // ! kiểm tra người dùng có phải là 'admin', 'lead-guide' hay không
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Lấy người dùng dựa trên email đã gửi
  const user = await User.findOne({ email: req.body.email });
  // kiểm tra người dùng có tồn tại không
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Tạo token đặt lại mật khẩu ngẫu nhiên
  const resetToken = user.createPasswordResetToken();
  // lưu người dùng
  await user.save({ validateBeforeSave: false });

  // 3) Gửi token tới email của người dùng
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  // thông báo trong mailstrap
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    // thực hiện gửi mail
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //! lấy người dùng dựa trên mã thông báo
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // tìm người dùng bằng passwordResetToken
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(user);

  //! nếu mã thông báo chưa hết hạn và có người dùng thì đặt lại password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //! cập nhật lại thuộc tính passwordChangedAt cho người dùng
  //! đăng nhập người dùng, gửi jwt
  // ! nếu tất cả đúng thì gửi kết quả
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: token,
  });
});
