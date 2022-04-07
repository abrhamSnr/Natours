const catchAsync = (fn) => {
  //fn is a function we will pass in which is the async function
  //The catch one will catch the error and pass to the global err handling middelware
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  catchAsync,
};
