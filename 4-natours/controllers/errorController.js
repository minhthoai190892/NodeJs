const AppError = require('../utils/appError');

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}
function handleDuplicateFieldDB(err) {
  // biểu thức này tìm kiếm chuỗi nằm giữa cặp dấu ngoặc kép hoặc nháy đơn trong thông báo lỗi.
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please user another value`;
  return new AppError(message, 400);
}
function handleValidationErrorDB(err) {
  /**
   *err.errors 
    - lỗi xác thực (validation) trong Mongoose tạo ra một đối tượng lỗi chứa thông tin về tất cả các lỗi cụ thể liên quan đến từng trường
    Object.values(err.errors) 
    - được sử dụng để lấy một mảng chứa các giá trị của các thuộc tính trong đối tượng err.errors.
     Mỗi phần tử trong mảng này là một đối tượng lỗi tương ứng với một trường trong mô hình bị lỗi.
     .map((err) => err.message)
     - được sử dụng để duyệt qua từng đối tượng lỗi trong mảng và trích xuất thông báo lỗi (err.message) từ mỗi đối tượng. 
     Kết quả là một mảng chứa các thông báo lỗi từ từng trường bị lỗi.
   */
  const errors = Object.values(err.errors).map((err) => err.message);
  console.log(errors);

  const message = `Invalid input data. ${errors.join(', ')}`;
  return new AppError(message, 400);
}
function handleJsonWebTokenError(err) {
  return new AppError('Invalid token. Please login try again', 401);
}
function handleTokenExpiredError(err) {
  return new AppError('Your token has expired! Please login try again', 401);
}
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong zzzzzzzzzzzzzzzz',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;
    error.code = err.code;
    error.errmsg = err.errmsg;
    console.log(error);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError(error);
      // console.log('JsonWebTokenError');
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }
    sendErrorProd(error, res);
  }

  // next();
};
