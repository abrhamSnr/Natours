const express = require('express');
const router = express.Router();
const {
  aliasTopRoute,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controller/tourController');

//router.param('id', checkId); Will check with params

router.route('/top-5-cheap').get(aliasTopRoute, getAllTours);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
