const {asyncHandler}=require("../utils/asyncHandler")
const {ApiResponse}=require("../utils/apiResponse")
const {ApiError}=require("../utils/apiError")
const {User}=require("../models/user.model")
const {uploadOnCloudinary,deleteImageFromCloudinary}=require("../utils/cloudinary.js")
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

    const avatar=await uploadOnCloudinary(avatarLocalPath,"avatars");
    if (!avatar) {
      return next(new ApiError(400, "Error uploading avatar file."));
      }
    
      let coverImage; 
      if(coverImageLocalPath){
         coverImage=await uploadOnCloudinary(coverImageLocalPath,coverImages);
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

const loginUser = asyncHandler(async (req, res,next) =>{

   const {email, username, password} = req.body
   console.log(email);
   console.log(username);
   console.log(password);
 
   if (!username && !email) {
     return next( new ApiError(400, "username or email is required"));
   }
 
    const user = await User.findOne({
        $or: [{userName:username}, {email:email}]  
   })
 // const user=await User.findOne({userName:username})
   console.log(user);//null value will return if the user does not exist.
   if (!user) { 
       return next( new ApiError(404, "User does not exist"));
   }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    return next( new ApiError(401, "Invalid user credentials"));
   }

   const accessToken=await user.generateAccessToken();
   user.password=undefined;
   user.createdAt=undefined;
   user.updatedAt=undefined;

   const options = {
       httpOnly: true,
       secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .json(
       new ApiResponse(
         200, 
         "User logged In Successfully",
         {user,accessToken}
       )
   )
});

//logOut User Controller
const logoutUser = asyncHandler(async(req, res) => {

   const options = {
       httpOnly: true,
       secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .json(new ApiResponse(200, {}, "User logged Out Successfully."))
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{

    const{oldPassword,newPassword}=req.body;
    let user=req.user;
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
      return next(new ApiError(400,"Invalid old password"))
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"Password Changed Successfully."))

});

//get Current user details
const getCurrentUser= (req,res)=>{
   return res.status(200).json(200,req.user,"current user fetched Successfully");
};

//update useremail
const updateAccountDetails = asyncHandler(async(req, res) => {
   const {email} = req.body

   if (!email) {
       return next( new ApiError(400, "All fields are required"));
   }

   const user = await User.findByIdAndUpdate(
       req.user?._id,
       {
           $set:{email:email}
       },
       {new: true}
       
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async (req, res, next) => {
   const avatarLocalPath = req.file?.path;
 
   if (!avatarLocalPath) {
     return next(new ApiError(400, "Avatar file is missing"));
   }
   await deleteImageFromCloudinary(req.user?.avatar,"avatars");
   const avatar = await uploadOnCloudinary(avatarLocalPath,"avatars");
 
   if (!avatar.url) {
     return next(new ApiError(500, "Error while uploading the avatar"));
   }
 
   const user = await User.findByIdAndUpdate(
     req.user?._id,
     {
       $set: { avatar: avatar.url },
     },
     { new: true }
   ).select("-password");
 
   return res.status(200).json(
     new ApiResponse(
       200,
       {user},
       "Avatar image updated successfully"
     )
   );
 });
 

const updateUserCoverImage = asyncHandler(async(req, res) => {
   const coverImageLocalPath = req.file?.path

   if (!coverImageLocalPath) {
      return next(new ApiError(400, "Cover image file is missing"))
   }

   await deleteImageFromCloudinary(req.user?.coverImage,"coverImages");
   const coverImage = await uploadOnCloudinary(coverImageLocalPath,"coverImages")

   if (!coverImage?.url) {
       return next(new ApiError(500, "Eror while urploading on avatar"))
   }

   const user = await User.findByIdAndUpdate(
       req.user?._id, 
       {
           $set:{ coverImage: coverImage.url  }
       },
       {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(
       new ApiResponse(200, user, "Cover image updated successfully")
   )
});

module.exports={
   registerUser,
   loginUser,
   logoutUser,
   getCurrentUser,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage

}