/**
 * lớp AppError kế thừa toàn bộ từ lớp Error
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    // mã trạng thái HTTP(400,404....) được truyền vào khi khởi tọa Error
    this.statusCode = statusCode;
    /* 
    thuộc tính status được thiết lập dựa trên statusCode
    .startsWith('4'): kiển tra mã trạng thái nếu bắt dầu là 4 (404,400) nếu không là lỗi server
    */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // giúp loại bỏ các phần không cần thiết trong ngăn xếp
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
