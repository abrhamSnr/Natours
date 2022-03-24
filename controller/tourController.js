const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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

const getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

const getTour = async (req, res) => {
  //optional params using ? ---> /api/v1/tours/:id/:x? ---> x params will be optional
  //Multiply string num with int it will authomaticly change it to int
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id: req.params.id}) same as findById
    res.status(200).json({ status: 'sucess', data: { tour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

// const checkTourBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({ status: 'fail', message: 'Invalid' });
//   }
//   next();
// };

const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body); //This will create a tour
    //a.k.a const newTour = new Tour({}) newTour.save()
    res.status(201).json({ status: 'sucess', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({ status: 'sucess', data: { tour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'sucess', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

module.exports = {
  aliasTopRoute,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};
