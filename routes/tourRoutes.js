const express = require('express');
const router = express.Router();
const {
  checkId,
  getAllTours,
  checkTourBody,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controller/tourController');

router.param('id', checkId); //Will check with params

router.route('/').get(getAllTours).post(checkTourBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
