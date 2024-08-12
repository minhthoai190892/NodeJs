require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

const app = require('./app');
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then((con) => {
  console.log('connect success');
});

app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});
