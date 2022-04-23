const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const User = require('../model/userModel');

const filterObj = (obj, ...allowedFiled) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFiled.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const updateMe = catchAsync(async (req, res, next) => {
  //Create an error if the user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for passowrd update'), 400);
  }

  //Update the user doc. Since we dont user the verify from passwordConfirm we can use, findByIdAndUpdate not save.
  //Filterd out unwanted fileds. only contain name and email
  const filterBody = filterObj(req.body, 'name', 'email');

  //Update values
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'sucess',
    data: updatedUser,
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    statuts: 'sucess',
    data: null,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const data = await User.find();

  res.status(200).json({
    status: 'sucess',
    users: {
      data
    }
  });
});

const createUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

module.exports = {
  updateMe,
  getAllUsers,
  createUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteMe,
};
