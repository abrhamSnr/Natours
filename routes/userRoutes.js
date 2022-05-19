const express = require('express');
const router = express.Router();
const {
  updateMe,
  getAllUsers,
  createUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteMe,
} = require('../controller/userController');
const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('../controller/authController');

router.post('/signup', signUp);
router.post('/login', logIn);

router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);

router.patch('/updatepassword', protect, updatePassword);
router.patch('/updateme', protect, updateMe);
router.delete('/deleteme', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
