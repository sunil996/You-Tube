const { ApiError } =require("../utils/ApiError.js");
const { asyncHandler } =require("../utils/asyncHandler");
const  jwt =require("jsonwebtoken");
const {User}=require("../models/user.model.js")

const verifyJWT = asyncHandler(async (req,res, next) => {
  try {
   // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    const token =req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(new ApiError(401, "Unauthorized request"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password ")
   
    if (!user) {
        return next( new ApiError(401, "Invalid Access Token"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, error?.message || "Invalid access token"));
  }
});

module.exports = {verifyJWT};
