const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');
const globalErrorHandle = require('./controllers/errorController');
const app = express();
// phần mềm trung gian của express
// ? dùng để chuyển đổi nội dung json sang object javascript
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
//!Global Error Handling Middleware
app.all('*', function (req, res, next) {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on the server`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on the server`);
  // err.status = 'Fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on the server`,404));
});
app.use(globalErrorHandle);
module.exports = app;
