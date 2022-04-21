const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo: String,
  role: {
    type: String,
    //enum will only allow us to specify certain users
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //To validate the password
    validate: {
      //This only works on Create and SAVE ----> Not gonna work findOneAndUpdate
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password is not similar',
    },
  },
  //This will be changed whenever someone changed a password and it will be a date of change
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//Middleware before save the user schema
//Hashing the password
userSchema.pre('save', async function (next) {
  //Only run this middleware when the password is modified
  if (!this.isModified('password')) return next();

  //Hashing passowrd with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

//Assign a value when we update a passoword middleware
userSchema.pre('save', async function (next) {
  //If we modified and the user is not new 
  if (!this.isModified('password') || this.isNew) return next();

  //If the token got created before the password
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

//Instance method
//Compare the hased password and the plain text password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //key word 'this' will not work since the select property is false for password
  //It will return boolean
  return await bcrypt.compare(candidatePassword, userPassword);
};

//To check if the pwd is changed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //The logic of this compare the timestamp of the JWT created token and the password changed date
  /*
    if jwttimestampe > passwordchangedAt {
      the password does not changed 
    }
    if jwttimestampe < passwordchangedAT {
      the password does change
    } 
  */
  if (this.passwordChangeAt) {
    //JWTTimeStamp is second so we have to change the date to second
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};

//This instant method helps to create a passowrd reset token
userSchema.methods.createPasswordResetToken = function () {
  //We can use crypto module to create a token
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;

  /**
   * We will send the plain reset token to the email and save the hased
   * token in database, it help later to compare both.
   */
};

const User = mongoose.model('User', userSchema);

module.exports = User;
