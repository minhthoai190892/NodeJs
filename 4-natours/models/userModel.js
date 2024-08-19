const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Please provide a valid email'],
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minlength: 8,
    // chỉ khi sử dụng phương thức find
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // hàm trả về true or false
    //
    validate: {
      validator: function (value) {
        // abc === abc =>true
        return value === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});
// ! middleware mongoose
// để thực hiện một số thao tác trước khi một tài liệu User được lưu vào cơ sở dữ liệu

userSchema.pre('save', async function (next) {
  // Nếu mật khẩu không được sửa đổi, tiếp tục lưu tài liệu mà không mã hóa
  if (!this.isModified('password')) return next();

  // Mã hóa mật khẩu với độ mạnh 12 rounds
  this.password = await bcrypt.hash(this.password, 12);

  // Xóa trường passwordConfirm
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now()-1000;
  next();
});

/**
 * Phương thức so sánh password
 * @param {*} candidatePassword -  password mà người dùng đăng nhập
 * @param {*} userPassword -  password có trên cơ sở dữ liệu
 * @returns true or false
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
/**
 *  Phương thức kiểm tra người dùng có thay đổi password không
 * @param {*} JWTTimestamp - nhận ngày tạo token
 * @returns true or false
 */

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // kiểm tra passwordChangedAt này có tồn tại không
  if (this.passwordChangedAt) {
    // chuyển đổi Date thành timestamps
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    // kiểm tra ngày tạo token và ngày thay đổi password
    // console.log(JWTTimestamp<changedTimestamp);

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
/**
 * Hàm tạo một token ngẫu nhiên dùng để thay đổi mật khẩu
 *
 * @returns - trả về một token chưa được mã hóa dùng để gửi cho người dùng thông qua email
 */
userSchema.methods.createPasswordResetToken = function () {
  // tạo một token ngẫu nhiên
  const resetToken = crypto.randomBytes(32).toString('hex');
  // mã hóa token bằng thuật toán sha256 và được lưu vào cơ sở dữ liệu
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  /* 
    tạo thời gian mã token hết hạn(10p) và được lưu vào cơ sở dữ liệu
     Date.now() - lấy thời gian hiện tại tính bằng milliseconds
     10 * 60 * 1000- đây là số milliseconds tương ứng với 10p
    */

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
