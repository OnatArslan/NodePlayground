const express = require('express');
const tourController = require(`./../controllers/tourController`);
const fs = require('fs');

const router = express.Router();

// Midleware functions accept (req, res, next) => next is a function()
// router for routes that have id parameter like  `/:id`
// val - value parameter is id
// router.param(`id`, tourController);

// new router on a route
router
  .route(`/`) // because of tourRaouter use (`/api/v1/tours`) we only need / and /:id routes
  .get(tourController.getAllTours)
  .post(tourController.createTour); // we add 2 middleware
router
  .route(`/:id`)
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
