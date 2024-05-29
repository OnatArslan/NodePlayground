const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const bcrypt = require('bcryptjs');
const sendEmail = require(`./../utils/email`);
const crypto = require('crypto');
// const { options } = require('../routes/userRoutes');

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
      role: req.body.role,
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

// Exporting an asynchronous function named 'protect'
exports.protect = async (req, res, next) => {
  // 1) Extracting the token from the 'Authorization' header
  let token;
  // Checking if the 'Authorization' header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(`Bearer`)
  ) {
    // If it does, split the header value by space (' ') and take the second part as the token
    token = req.headers.authorization.split(` `)[1];
  }
  // If no token is found, return a response with a status code of 401 (Unauthorized) and an error message
  if (!token) {
    return res.status(401).json({
      status: `fail`,
      message: `You are not logged in! Please log in to get access`,
    });
  }
  // 2) Verifying the token
  // The 'promisify' function is used to turn the callback-based 'jwt.verify' function into a promise-based one
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Checking if the user still exists
  // The 'findById' method is used to find a user by their ID
  const freshUser = await User.findById(decoded.id);
  // If no user is found, return a response with a status code of 401 (Unauthorized) and an error message
  if (!freshUser) {
    return res.status(401).json({
      status: `fail`,
      message: `User has been deleted, Please register and try again`,
    });
  }

  // 4) Checking if the user changed their password after the token was issued
  // The 'changedPasswordAfter' method is used to check if the password was changed after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    // If it was, return a response with a status code of 401 (Unauthorized) and an error message
    return res.status(401).json({
      status: `fail`,
      message: `User recently changed password! Please log in again`,
    });
  }

  // If all checks pass, grant access to the protected route
  // The user's details are added to the request object, so they can be accessed in the next middleware or route handler
  req.user = freshUser;
  // Call the 'next' function to move to the next middleware or route handler
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        status: `fail`,
        message: `You must be an ${roles} to perform this action`,
      });
    }
    next();
  };
};

// This is an exported asynchronous function named 'forgotPassword'
exports.forgotPassword = async (req, res, next) => {
  // The function starts by trying to find a user in the database with the email provided in the request body
  const user = await User.findOne({ email: req.body.email });

  // If no user is found with the provided email, it sends a response with a status code of 401 (Unauthorized) and an error message
  if (!user) {
    return res.status(401).json({
      status: `fail`,
      message: `Your email is wrong`,
    });
  }

  // If a user is found, it generates a password reset token using a method on the user model
  const resetToken = user.createPasswordResetToken();

  // The user document is then saved to the database. The 'validateBeforeSave' option is set to false to bypass any validation checks
  await user.save({
    validateBeforeSave: false,
  });

  // A reset URL is created using the host from the request and the generated reset token
  const resetURL = `http://${req.get(
    `host`
  )}/api/v1/users/resetPassword/${resetToken}`;

  // A message is created instructing the user to send a PATCH request to the reset URL with their new password and password confirmation
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}\n
  If you didn't forget your password, please ignore this email`;

  // A try-catch block is used to handle any errors that might occur when sending the email
  try {
    // The 'sendEmail' function is called with an object containing the user's email, a subject, and the message
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 10 min)`,
      message: message,
    });

    // If the email is sent successfully, a response is sent with a status code of 200 (OK) and a success message
    res.status(200).json({
      status: `success`,
      message: `Token sent to email`,
    });
  } catch (err) {
    // The password reset token and expiration fields on the user document are set to undefined
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // The user document is saved again to the database
    await user.save({ validateBeforeSave: false });

    // A response is sent with a status code of 500 (Internal Server Error) and an error message
    return res.status(500).json({
      status: `fail`,
      message: `Something went wrong, we cannot send you password reset mail`,
    });
  }
};

// This function is exported and is responsible for resetting a user's password
exports.resetPassword = async (req, res, next) => {
  try {
    // The function starts by hashing the token provided in the request parameters using the SHA256 algorithm
    const hashedToken = crypto
      .createHash(`sha256`)
      .update(req.params.token)
      .digest(`hex`);

    // It then tries to find a user in the database with a matching password reset token and a password reset expiration date that is in the future
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // If no user is found, it sends a response with a status code of 400 (Bad Request) and an error message
    if (!user) {
      return res.status(400).json({
        status: `fail`,
        message: `Token is invalid or has expired`,
      });
    }

    // If a user is found, it sets the new password and password confirmation on the user document and clears the password reset token and expiration date
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // The user document is then saved to the database. The 'validateBeforeSave' option is set to true to ensure that the new password is validated before being saved
    await user.save({
      validateBeforeSave: true,
    });

    // A JWT token is created for the user using their ID and the secret key from the environment variables. The token's expiration time is also set from the environment variables
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // A response is sent with a status code of 200 (OK), a success message, and the JWT token
    res.status(200).json({
      status: `success`,
      message: `Your password successfully changed, Logging in...`,
      data: {
        token: token,
      },
    });
  } catch (err) {
    // If an error occurs at any point in the function, it is logged to the console and a response is sent with a status code of 400 (Bad Request) and the error message
    console.log(err);
    res.status(400).json({
      status: `fail`,
      message: err,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select(`+password`);
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res.status(400).json({
        status: `fail`,
      });
    }
    // Change password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPassword;
    await user.save();

    // Log in user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: `fail`,
      message: `Your password changed succesfuly`,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: `fail`,
      message: `Cant done`,
    });
  }
};
