const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
router.param('id', (req, res, next, value) => {
  console.log(`user id: ${value}`);
  next();
});
router
  .route('/')
  .get(userController.getAlluUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
// module.exports là đối tượng mặc định mà một module sẽ trả về khi bạn yêu cầu nó bằng require() trong một file khác.
module.exports = router;
