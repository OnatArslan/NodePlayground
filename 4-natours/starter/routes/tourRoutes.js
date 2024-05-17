const express = require('express');
const tourController = require(`./../controllers/tourController`);
const authController = require(`./../controllers/authController.js`);
const fs = require('fs');

const router = express.Router();

// Midleware functions accept (req, res, next) => next is a function()
// router for routes that have id parameter like  `/:id`
// val - value parameter is id
// router.param(`id`, tourController);

// new router on a route
// get all tours and create new tour routes
router
  .route(`/`) // because of tourRaouter use (`/api/v1/tours`) we only need / and /:id routes
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour); // we add 2 middleware

// Get tours stats
router.route(`/tour-stats`).get(tourController.getTourStats);

router.route(`/monthly-plan/:year`).get(tourController.getMonthlyPlan);

// get 5 most popular tours route
router
  .route(`/top-5-tours`)
  .get(tourController.aliasTopTours, tourController.getAllTours);

// id based routes
router
  .route(`/:id`)
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    // authController.restrictTo(`admin`, `lead-guide`),
    tourController.deleteTour
  );

module.exports = router;
