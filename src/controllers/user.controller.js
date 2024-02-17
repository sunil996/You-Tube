const {asyncHandler}=require("../utils/asyncHandler")
const {ApiResponse}=require("../utils/apiResponse")

const registerUser=asyncHandler(async(req,res)=>{
      new ApiResponse(200,null,"ok" );
     //res.status(200).json(  new ApiResponse(200,null,"ok") );
     
    console.log("hifodfisdj");
})
module.exports={registerUser}