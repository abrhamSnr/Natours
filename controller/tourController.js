const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const checkId = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
//Quering on from the api ----> ?x=2&y=0

//Middelware for geting top 5 rated cheap tours
const aliasTopRoute = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .pagination();
  const allTours = await features.query;

  res.status(200).json({
    status: 'success',
    results: allTours.length,
    date: req.requstTime,
    data: { allTours },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  //optional params using ? ---> /api/v1/tours/:id/:x? ---> x params will be optional
  //Multiply string num with int it will authomaticly change it to int

  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('We can not find the id', 404));
  }

  //Tour.findOne({_id: req.params.id}) same as findById
  res.status(200).json({ status: 'sucess', data: { tour } });
});

// const checkTourBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({ status: 'fail', message: 'Invalid' });
//   }
//   next();
// };

const createTour = catchAsync(async (req, res, next) => {
  //This will create a tour
  const newTour = await Tour.create(req.body); 

  //a.k.a const newTour = new Tour({}) newTour.save()
  res.status(201).json({ status: 'sucess', data: { tour: newTour } });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('We can not find the id', 404));
  }

  res.status(201).json({ status: 'sucess', data: { tour } });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('We can not find the id', 404));
  }

  res.status(204).json({ status: 'sucess', data: null });
});

//Aggregation Pipline in mongoDB to calculate different stats
const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, //Look for the match
    },
    {
      $group: {
        //Not separated by groups
        // _id: null, 
        //Separate by difficulty
        _id: '$difficulty', 
        //When the doc went to the pipline
        numTours: { $sum: 1 }, 
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      //The result in Ascending order
      $sort: { avgPrice: 1 }, 
    },
  ]);
  res.status(200).json({ status: 'sucess', data: { stats } });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      //This will deconstruct an array
      $unwind: '$startDates', 
    },
    {
      $match: {
        //Looking for the macth in data
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //Group the given results
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      //Addfields will add new field
      $addFields: { month: '$_id' }, 
    },
    {
      //If project is 1 ----> Show the value and project is 0 hide the value
      $project: { _id: 0 }, 
    },
    {
      //If Sort is -1 ----> Descending Order and Sort is 1 -----> Ascending order
      $sort: { numTourStarts: -1 }, 
    },
  ]);
  res.status(200).json({ status: 'sucess', data: { plan } });
});

module.exports = {
  aliasTopRoute,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
};
