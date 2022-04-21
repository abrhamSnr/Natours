const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../controller/authController');
const {
  aliasTopRoute,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
} = require('../controller/tourController');

//router.param('id', checkId); Will check with params

router.route('/top-5-cheap').get(aliasTopRoute, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(protect, getAllTours).post(createTour);
//We needed to protect deleteroute to be acccess only for admins
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guid'), deleteTour);

module.exports = router;
