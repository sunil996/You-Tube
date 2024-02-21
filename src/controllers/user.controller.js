const {asyncHandler}=require("../utils/asyncHandler")
const {ApiResponse}=require("../utils/apiResponse")
const {ApiError}=require("../utils/apiError"
)
const registerUser=asyncHandler(async(req,res,next)=>{
      
     const {fullName,email,username,password}=req.body;
     if([fullName,email,username,password].some((field)=> 
         field?.trim()===""
      ))
     {
        return next(new ApiError(400,"Provide values for all fields."))
     
     }
    
     
})
module.exports={registerUser}