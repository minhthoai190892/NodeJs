require('dotenv').config({ path: './config.env' });
const app = require('./app');
const port = process.env.PORT || 3000;
// console.log(process.env);

app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});
