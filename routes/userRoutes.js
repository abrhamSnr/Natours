const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controller/userController');
const { signUp, logIn, forgotPassword, resetPassword } = require('../controller/authController');

router.post('/signup', signUp);
router.post('/login', logIn);

router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);

router.route('/').get(getAllUsers).post(createUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
