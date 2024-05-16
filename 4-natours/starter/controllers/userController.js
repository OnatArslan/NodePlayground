const User = require('./../models/userModel');

exports.getAllUsers = (req, res) => {
  try {
    const users = User.find();
    res.status(200).json({
      status: `success`,
      data: {
        users: users,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: `fail`,
      message: err,
    });
  }
};

exports.getOneUser = async (req, res) => {
  res.status(500).json({
    status: `fail`,
    message: `This route is not working`,
  });
};
exports.createUser = async (req, res) => {
  res.status(500).json({
    status: `fail`,
    message: err,
  });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: `err`, message: `This route is not yet defined` });
};

exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: `err`, message: `This route is not yet defined` });
};
