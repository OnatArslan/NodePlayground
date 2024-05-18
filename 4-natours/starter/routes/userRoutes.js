const express = require('express');
const userController = require(`./../controllers/userController`);
const authController = require(`./../controllers/authController`);
// Users route handlers

// User routes
const router = express.Router();

// This is a middleware function with parameter and this is id in this case
// router.param(`id`, (req, res, next, value) => {
//   console.log(`Your user id is ${value}`);
// });

// because of usersRaouter use (`/api/v1/userss`) we only need / and /:id routes

// These are user routes for signup signin
router.post(`/signup`, authController.signup);
router.post(`/login`, authController.login);
// Reset password routes
router.post(`/forgotPassword`, authController.forgotPassword);
router.patch(`/resetPassword/:token`, authController.resetPassword);

// These are admin routes
router
  .route(`/`)
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route(`/:id`)
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
