const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A tour name is required'],
    unique: true,
  },

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
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
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
  },
  startDates: [Date],
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
