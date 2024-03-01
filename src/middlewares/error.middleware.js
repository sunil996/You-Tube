const { ApiError } = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {

  if (err.name === 'TokenExpiredError') {
     
    return res.status(401).json({
      statusCode:401,
      success: false, 
      message:"Token has Expired"
    });
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  
  res.status(statusCode).json({
  statusCode,
  success: false, 
  message
});
};

module.exports = { errorHandler };