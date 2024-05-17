const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const bcrypt = require('bcryptjs');

// Exporting an asynchronous function named 'signup'
exports.signup = async (req, res, next) => {
  try {
    // Creating a new user using the User model. The user's details are extracted from the request body.
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    // Generating a JSON Web Token (JWT) for the new user. The token payload contains the user's ID.
    // The token is signed with a secret key stored in environment variables and has an expiration time also set in environment variables.
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Sending a response with a status code of 200 (OK). The response body contains the status, the JWT, and the user's details.
    res.status(200).json({
      status: `success`,
      token: token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    // If an error occurs, a response with a status code of 404 (Not Found) is sent. The response body contains the status and the error message.
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

// Exporting an asynchronous function named 'login'
exports.login = async (req, res, next) => {
  try {
    // Destructuring email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      // If not, send a response with a status code of 400 (Bad Request) and an error message
      return res.status(400).json({
        status: `fail`,
        message: `Please provide email and password `,
      });
    }

    // Find a user with the provided email. The '+password' option is used to include the password in the result, as it is excluded by default.
    const user = await User.findOne({ email: email }).select(`+password`);

    // Check if a user was found and if the provided password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      // If not, send a response with a status code of 400 (Bad Request) and an error message
      return res.status(400).json({
        status: `fail`,
        message: `email or password is wrong `,
      });
    }

    // If the user was found and the password is correct, generate a JWT for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Send a response with a status code of 200 (OK) and  the JWT (Token)
    res.status(200).json({
      status: `success`,
      token: token,
    });
  } catch (err) {
    // If an error occurs, send a response with a status code of 404 (Not Found), an error message, and a password for some reason (this should probably be removed)
    res.status(404).json({
      status: `fail`,
      message: err,
      password: '12345678',
    });
  }
};

exports.protect = async (req, res, next) => {
  // 1) Getting token and check of it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(`Bearer`)
  ) {
    token = req.headers.authorization.split(` `)[1];
  }
  if (!token) {
    return res.status(401).json({
      status: `fail`,
      message: `You are not logged in! Please log in to get access`,
    });
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return res.status(401).json({
      status: `fail`,
      message: `User has been deleted, Please register and try again`,
    });
  }
  // 4) Check if user changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      status: `fail`,
      message: `User receantly changed password! Please log in again`,
    });
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
};
