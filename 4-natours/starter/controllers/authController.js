const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
      status: `success`,
      token: token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    // const email = req.body.email; --> OLD WAY
    // const password = req.body.password;
    const { email, password } = req.body; // with destructring
    // 1) If email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: `fail`,
        message: `Please provide email and password `,
      });
    }
    // 2) Check if user exist && password is correct
    const user = await User.findOne({ email: email }).select(`+password`);

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(400).json({
        status: `fail`,
        message: `email or passowrd is wrong `,
      });
    }
    // 3) If everything OK send token to client
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
      status: `success`,
      token: token,
      data: {},
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
      password: '12345678',
    });
  }
};
