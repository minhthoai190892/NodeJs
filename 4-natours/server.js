require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

const app = require('./app');
console.log(process.env.NODE_ENV);
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then((con) => {
  console.log('connect success');
});

const server = app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});

// Lỗi bên ngoài Express: Từ chối chưa được xử lý
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  // tự động tắt ứng dụng
  server.close(() => {
    process.exit(1);
  });
});
