const express = require('express');
const app = express();
const port = 100;

app.get('/', (req, res) => {
  //   res.status(200).send('Welcome to express');
  res.status(200).json({
    message: 'Welcome to express',
    app: 'express',
  });
});
app.post('/', (req, res) => {
  res.status(200).json({ message: 'success', app: 'express' });
});
app.listen(port, (req, res) => {
  console.log(`listening on ${port}`);
});
