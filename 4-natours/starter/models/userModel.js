// Importing required modules
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
// Adding a method to the userSchema methods object
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

// Adding a method to the userSchema for check if password changed
userSchema.methods.changedPasswordAfter = function (JWTTimestapmt) {
  if (this.passwordChangedAt) {
    const changedTimeStampt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(changedTimeStampt, JWTTimestapmt);
    return JWTTimestapmt < changedTimeStampt; // 100
  }
  // False means NOT changed
  return false;
};

// Creating the User model from the userSchema
const User = mongoose.model(`User`, userSchema);

// Exporting the User model
module.exports = User;
