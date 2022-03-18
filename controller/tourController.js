const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const checkId = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    date: req.requstTime, //This came from the middle ware
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  //optional params using ? ---> /api/v1/tours/:id/:x? ---> x params will be optional
  const id = req.params.id * 1; //Multiply string num with int it will authomaticly change it to int
  const tour = tours.find((el) => el.id === id);
  if (!tours) {
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  }
  res.status(200).json({ status: 'sucess', data: { tour } });
};

const checkTourBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({ status: 'fail', message: 'Invalid' });
  }
  next();
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'sucess', data: { tours: newTour } });
    }
  );
};

const updateTour = (req, res) => {
  res.status(200).json({ status: 'sucess', massage: 'File got updated' });
};

const deleteTour = (req, res) => {
  res.status(204).json({ status: 'sucess', data: null });
};

module.exports = {
  checkId,
  getAllTours,
  getTour,
  checkTourBody,
  createTour,
  updateTour,
  deleteTour,
};
