const mongoose = require('mongoose');
/*
slugify là một kỹ thuật hoặc công cụ thường được sử dụng 
để chuyển đổi một chuỗi văn bản (thường là tiêu đề hoặc tên) thành một "slug" - một định dạng phù hợp cho URL
*/
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A tour name is required'],
      unique: true,
      validate: [validator.isAlpha,'tour name must only characters']
    },
    slu: String,
    duration: {
      type: Number,
      required: [true, 'A tour duration is required'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour maxGroupSize is required'],
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'A tour difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'Difficulty is either: easy or medium or difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating mus be above 1.0'],
      max: [5, 'Rating mus be above 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour price is required'],
    },
    priceDiscount: {
      type: Number,
      // ! Data Validation: Custom Validators
      validate: {
        validator: function (value) {
          // chỉ khi tạo tài liệu mới mới thực hiện
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price ',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour summary is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A tour description is required'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour imageCover is required'],
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // ẩn field
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// !Virtual Properties
// ? không thể sử dụng thuộc tính ảo để truy vấn dữ liệu
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// !Document Middleware Mongoose
// ? chạy trước khi .save() và .create()
tourSchema.pre('save', function (next) {
  this.slu = slugify(this.name, { lower: true });
  next();
});
// ? chạy sau khi .save() và .create()
tourSchema.post('save', function (doc, next) {
  console.log(doc);

  next();
});
// !Query Middleware
/*
  Mẫu /^find/ sẽ áp dụng middleware này cho các phương thức như find, findOne, findById, findOneAndUpdate, v.v.
*/
tourSchema.pre(/^find/, function (next) {
  //  $ne: not equal -  tìm một giá trị cụ thể không bằng với giá trị được xác định
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(doc);

  next();
});
// !Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
