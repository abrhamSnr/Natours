const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//Create jwt token creater and function
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });
  const token = signToken(newUser._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email and psw exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //Check if user exits and password is correct. Select will select the password from the user
  const user = await User.findOne({ email }).select('+password');

  //If there is no user (!user) or the password does not match
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //If everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token,
  });
});

//Middleware to check the user is logged in to get all the tour
const protect = catchAsync(async (req, res, next) => {
  // Getting the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //This will help to get the token after split token and take from second value from the array
    token = req.headers.authorization.split(' ')[1];
  }
  //If the token does not given
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  //Verfication of the token (valid or not). This will help us to prevent wrong id
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //Check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user beloging to this token does no longer exist', 401)
    );
  }

  //Check if user changed password after the token was issued. If a user change the password the token before the password change should not be valid. To implement this we need instance method on user model
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password: Please log in again', 401)
    );
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  next();
});

//Restrict perform some tasks to certain user. We use destructring on parameter because we pass an on that method
const restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-guid'], role='user'
    //req.user is coming from the protect middleware
    /*
      if req.user.role in ['admin','lead-guid'] {
        show a permission error 
      }else{
        go to the next task 
      }
    */
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have a permission to perform this action', 403)
      );
    }

    next();
  };
};

//Forgot password which will get the email and create a reset token
const forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  //Generate a random reset token. Another Instance method
  const resetToken = user.createPasswordResetToken();

  // Since we modify the schema we need to save and remove the validator on the schema
  await user.save({ validateBeforeSave: false });

  //Send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your passoword? Submit a PATCH request with your new password and 
  password confirmation to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your passowrd reset token valid for 10 min',
      message,
    });

    res.status(200).json({
      status: 'sucess',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  //1, Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //We are at the same time checking for the user and if the token is expired or not
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2, If the token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3, Update changedpassword property for the user

  //4, Login the user in, send the jwt token
  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token,
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  // Get User From collection
  const user = await User.findById(req.user._id).select('+password');

  if (
    !req.body.currentPassword ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    return next(new AppError('Enter a password'), 401);
  }

  //Check if posted current password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // If so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log user in send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'sucess',
    token,
  });
});

module.exports = {
  signUp,
  logIn,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
