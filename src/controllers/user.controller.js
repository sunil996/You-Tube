const {asyncHandler}=require("../utils/asyncHandler")
const {ApiResponse}=require("../utils/apiResponse")
const {ApiError}=require("../utils/apiError")
const {User}=require("../models/user.model")
const {uploadOnCloudinary}=require("../utils/cloudinary.js")
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


//Controllers for user

const registerUser=asyncHandler(async(req,res,next)=>{
      
   let { userName,fullName,email,password } = req.body;
   fullName = fullName?.trim();
   email = email?.trim();
   userName = userName?.trim();
   password = password?.trim();
    
   if(!userName || !fullName || !email || !password){
      return next(new ApiError(400, " Provide all the values for fields.."));
   }
   if(password.length<6 || password.length>20   ){
      return next(new ApiError(400, "Password should be between 6 and 20 characters."));
   } 
   if (!emailRegex.test(email)) {
      return next(new ApiError(400, "Invalid email format."));
  }

  if (!emailRegex.test(email)) {
   return next(new ApiError(400, "Invalid email format."));
   }

   if (!email.includes("@gmail.com")) {
   return next(new ApiError(400, "The email must be from Gmail domain (@gmail.com)."));
   } 

   const existedUser=await User.findOne({$or:[{userName},{ email}]});

   if(existedUser){ 
      return next(new ApiError(409, "User already exists."));
   }
    // console.log(req.files.avtar[0]);
    const avatarLocalPath=req.files?.avatar?.[0]?.path;
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
    
    if(!avatarLocalPath){
      return next(new ApiError(400,"Avatar file is required..")) 
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      return next(new ApiError(400, "Error uploading avatar file."));
      }
    
      let coverImage; 
      if(coverImageLocalPath){
         coverImage=await uploadOnCloudinary(coverImageLocalPath);
         if (!coverImage) {
            return next(new ApiError(400, "Error uploading cover image file."));
        }
      }


      const user= await User.create({
      userName:userName.toLowerCase(),
      fullName,
      email,
      password,
      avatar:avatar.url, 
      coverImage:coverImage?.url || ""
    })
    
   if (!user) {
      return next(new ApiError(500, "Failed to register the user."));
   }
   user.password = undefined;
   user.createdAt = undefined;
   user.updatedAt = undefined;

   return res.status(201).json(new ApiResponse(201,"user created successfully",user))
      
});

const loginUser = asyncHandler(async (req, res) =>{
   // req body -> data
   // username or email
   //find the user
   //password check
   //access and referesh token
   //send cookie

   const {email, username, password} = req.body
   console.log(email);

   if (!username && !email) {
     return next( new ApiError(400, "username or email is required"));
   }
 
   const user = await User.findOne({
       $or: [{username}, {email}]
   })

   if (!user) {
       throw new ApiError(404, "User does not exist")
   }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
   throw new ApiError(401, "Invalid user credentials")
   }

  const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
       httpOnly: true,
       secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
       new ApiResponse(
           200, 
           {
               user: loggedInUser, accessToken, refreshToken
           },
           "User logged In Successfully"
       )
   )

})
module.exports={registerUser}