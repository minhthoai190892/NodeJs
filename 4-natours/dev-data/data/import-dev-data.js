require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then((con) => {
  console.log('connect success');
});
// đọc file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    // create có thể chấp nhận một mảng đối tượng
    await Tour.create(tours);
    console.log('Import completed');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);

};

const deleteData = async () => {
  try {
    // create có thể chấp nhận một mảng đối tượng
    await Tour.deleteMany();
    console.log('Delete completed');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};
// node .\dev-data\data\import-dev-data.js --import
console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else {
  deleteData();
}
