const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
    select: false,
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
const User = mongoose.model('User', userSchema);
module.exports = User;
