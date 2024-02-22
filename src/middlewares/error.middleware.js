const { ApiError } = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // console.log(err.stack);
 res.status(statusCode).json({
  statusCode,
  success: false, 
  message
});
};

module.exports = { errorHandler };