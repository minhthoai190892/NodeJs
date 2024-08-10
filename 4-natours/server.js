const app = require('./app');
const port = 100;

app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});
