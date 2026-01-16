// utils/wrapAsync.js
module.exports = (fn) => {
  // Make sure all 3 arguments are here: (req, res, next)
  return (req, res, next) => {
    // Make sure next is passed here too
    fn(req, res, next).catch(next);
  };
};
