// Importing required modules
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Defining the schema for the User model
const userSchema = new mongoose.Schema({
  name: {
    type: String, // The data type of the name field is String
    required: [true, `You must have name`], // The name field is required
  },
  email: {
    type: String, // The data type of the email field is String
    required: [true, `You must have email`], // The email field is required
    unique: true, // The email field must be unique
    lowercase: true, // The email field will be converted to lowercase
    validate: {
      validator: validator.isEmail, // The email field must be a valid email address
      message: `{VALUE} is not proper email adress`, // Custom error message for invalid email
    },
  },
  photo: {
    type: String, // The data type of the photo field is String
  },
  role: {
    type: String,
    enum: {
      values: [`user`, `guide`, `lead-guide`, `admin`],
      message: `Difficulty is either: user, guide, lead-guide, admin, {VALUE} is not supported`,
      default: `user`,
    },
  },
  password: {
    type: String, // The data type of the password field is String
    required: [true, `Please enter a password`], // The password field is required
    minLength: 8, // The password field must have a minimum length of 8
    select: false,
  },
  passwordConfirm: {
    type: String, // The data type of the passwordConfirm field is String
    required: [true, `Please confirm your password`], // The passwordConfirm field is required
    validate: {
      // Custom validator to check if passwordConfirm is the same as password
      validator: function (val) {
        return val === this.password;
      },
      message: `Passwords are not the same`, // Custom error message for non-matching passwords
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

// Pre-save middleware to hash the password before saving the user document
userSchema.pre(`save`, async function (next) {
  // If the password field is not modified, skip this middleware
  if (!this.isModified(`password`)) {
    return next();
  } else {
    // Hash the password with a salt of 12
    this.password = await bcrypt.hash(this.password, 12);
    // Remove the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
  }
});

// INSTANCE METHOD
// Adding a method to the userSchema methods object for check password
userSchema.methods.correctPassword = async function (
  candidatePassword, // The password entered by the user
  userPassword // The hashed password stored in the database
) {
  // Use bcrypt's compare method to check if the entered password, when hashed,
  // matches the hashed password stored in the database
  // This method returns a Promise that resolves to a boolean: true if the passwords match, false otherwise
  // The await keyword is used to pause the execution of the function until the Promise is resolved
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Adding a method to the userSchema to check if the password was changed after a given timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // Check if the passwordChangedAt field exists
  if (this.passwordChangedAt) {
    // Convert the date in passwordChangedAt to a Unix timestamp (seconds since 1970-01-01 00:00:00 UTC)
    // The getTime method returns the time in milliseconds, so it is divided by 1000 to convert it to seconds
    // The result is then rounded down to the nearest integer using parseInt
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // Log the changed timestamp and the JWT timestamp for debugging purposes
    console.log(changedTimestamp, JWTTimestamp);

    // If the JWT timestamp is less than the changed timestamp, the password was changed after the token was issued
    // In this case, return true
    return JWTTimestamp < changedTimestamp;
  }

  // If the passwordChangedAt field does not exist, the password was not changed
  // In this case, return false
  return false;
};

// Create generate random string token for password reset funcionalty
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString(`hex`);
  this.passwordResetToken = crypto
    .createHash(`sha256`)
    .update(resetToken)
    .digest(`hex`);

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Creating the User model from the userSchema
const User = mongoose.model(`User`, userSchema);

// Exporting the User model
module.exports = User;
