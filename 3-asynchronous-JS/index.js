const superagent = require('superagent');

const fs = require('fs');
fs.readFile(`${__dirname}/dog.txt`, (error, data) => {
  //   console.log(`Breed: ${data}`);
  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .end((error, res) => {
      if (error) {
        return console.log(error.message);
      }
      console.log(res.body);
      fs.writeFile('dog-img.txt', res.body.message, (error) => {
        console.log('saved image');
      });
    });
});
