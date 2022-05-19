const express = require('express');
const router = express.Router();

const {
  getAllReviews,
  createReviews,
} = require('../controller/reviewController');
const { protect, restrictTo } = require('../controller/authController');

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReviews);

module.exports = router;
