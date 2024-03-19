const {asyncHandler}=require("../utils/asyncHandler")
const {ApiResponse}=require("../utils/apiResponse")
const {ApiError}=require("../utils/apiError")
const {User}=require("../models/user.model")
const {uploadOnCloudinary,deleteMediaFileFromCloudinary}=require("../utils/cloudinary.js")
const { getPublicIdFromUrl }=require("../utils/utilFunctions.js")
const fs=require("fs");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const path = require('path');
const jwt = require("jsonwebtoken");
const transporter=require("../utils/mailer.js") 
const { pipeline } = require("stream")
const { default: mongoose } = require("mongoose")

const registerUser=asyncHandler(async(req,res,next)=>{
      
   let { userName,fullName,email,password } = req.body;
   const avatarLocalPath=req.files?.avatar?.[0]?.path;
   const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

   fullName = fullName?.trim();
   email = email?.trim();
   userName = userName?.trim();
   password = password?.trim();
    
   if(!userName || !fullName || !email || !password){
      
      if(avatarLocalPath){
        fs.unlinkSync(avatarLocalPath)
     }
     if(coverImageLocalPath){
        fs.unlinkSync(coverImageLocalPath)
     }
      return next(new ApiError(400, " Provide all the values for fields.."));
   }
   if(password.trim().length<6 || password.trim().length>20   ){

      if(avatarLocalPath){
        fs.unlinkSync(avatarLocalPath)
    }
    if(coverImageLocalPath){
        fs.unlinkSync(coverImageLocalPath)
    }
      return next(new ApiError(400, "Password should be between 6 and 20 characters."));
   } 
   if (!emailRegex.test(email)) {
      if(avatarLocalPath){
        fs.unlinkSync(avatarLocalPath)
    }
    if(coverImageLocalPath){
        fs.unlinkSync(coverImageLocalPath)
    }
      return next(new ApiError(400, "Invalid email format."));
  }
 

   if (!email.includes("@gmail.com")) {

      if(avatarLocalPath){
          fs.unlinkSync(avatarLocalPath)
       }
      if(coverImageLocalPath){
          fs.unlinkSync(coverImageLocalPath)
      }
   return next(new ApiError(400, "The email must be from Gmail domain (@gmail.com)."));
   } 

   const existedUser=await User.findOne({$or:[{userName:userName?.trim()},{ email:email?.trim()}]});

   if(existedUser){
    
      if(avatarLocalPath){
        fs.unlinkSync(avatarLocalPath);
      }
      if(coverImageLocalPath){
        fs.unlinkSync(coverImageLocalPath)
      }
      return next(new ApiError(409, "User already exists."));
   }

    
    if(!avatarLocalPath){

      if(coverImageLocalPath){
        fs.unlinkSync(coverImageLocalPath)
      }
      return next(new ApiError(400,"Avatar file is required..")) 
    }

    if(req.files?.avatar?.[0].mimetype.includes("video")){
       
      fs.unlinkSync(avatarLocalPath);

      if(coverImageLocalPath){
        fs.unlinkSync(coverImageLocalPath)
      }
      return next(new ApiError(400,"Please provide only an image file for avatar field.."))
    } 
    

    if(coverImageLocalPath){
       if(req.files?.coverImage?.[0]?.mimetype.includes("video")){

        fs.unlinkSync(avatarLocalPath)
        fs.unlinkSync(coverImageLocalPath);
        return next(new ApiError(400,"Please provide only an image file for coverImage field.."))
       }
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath,"avatars");

    if (!avatar) {
      return next(new ApiError(400, "Error uploading avatar file."));
      }
      
      let coverImage; 
      if(coverImageLocalPath){
         coverImage=await uploadOnCloudinary(coverImageLocalPath,"coverImages");
         if (!coverImage) {
            return next(new ApiError(400, "Error uploading cover image file."));
        } 
      }
      
      const user= await User.create({
      userName:userName.toLowerCase(),
      fullName:fullName?.trim(),
      email:email?.trim(),
      password:password?.trim(),
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
  
   if (!username?.trim() && !email?.trim()) {
     return next( new ApiError(400, "username or email is required"));
   }
 
    const user = await User.findOne({
        $or: [{userName:username?.trim()}, {email:email?.trim()}]  
   })
  
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
  res.status(201).json(new ApiResponse(200,"successful login",accessToken))
  //  return res
  //  .status(200)
  //  .cookie("accessToken", accessToken, options)
  //  .json(
  //      new ApiResponse(
  //        200, 
  //        "User logged In Successfully",
  //        {user,accessToken}
  //      )
  //  )
});

 
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

const changeCurrentPassword=asyncHandler(async(req,res,next)=>{

    const{oldPassword,newPassword}=req.body;
    if(!oldPassword?.trim() || !newPassword?.trim()){
      return next(new ApiError(400,"oldPassword and newPassword is required.."));
    }
    if(newPassword?.trim().length<6){
        return next(new ApiError(400,"new Password lenght should be greater than 6."))
    }
    
    let user=await User.findById({_id:req.user?._id});
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword?.trim());

    if(!isPasswordCorrect){
      return next(new ApiError(400,"Invalid old password"))
    }
    user.password=newPassword?.trim();
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,"Password Changed Successfully.",{}))

});

const forgotPassword=asyncHandler(async(req,res,next)=>{
    
     const { email } = req.body;
    
     if(!email?.trim()){
      return next(new ApiError(400,"email is required !"))
     }  

     const user = await User.findOne({email:email?.trim()});
     
     if(!user) {
        return next(new ApiError(404,"email is not registred !"))
     }
 
     const resetToken=  jwt.sign({userId:user?._id},process.env.RESET_TOKEN_SECRET,{expiresIn:process.env.RESET_TOKEN_SECRET_EXPIRY}) ;
     console.log(resetToken)
     const resetLink=`http://localhost:${process.env.PORT}/api/v1/users/reset-password/${resetToken}`;
     console.log(resetLink)

     const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user?.email,
      subject: "Password Reset Request",
      html: `Click on this link <a href=${resetLink}>${resetLink}</a> to reset your password.`,
    };
     
    const sendMailToUser=await transporter.sendMail(mailOptions);
     
  res.status(200).json(new ApiResponse(200,"Reset email sent successfully",null))

});


const resetPassword = asyncHandler(async (req, res, next) => {

    let { token } = req.params;
    
    const { newPassword } = req.body;
   
    if(!token?.trim()){
      return next(new ApiError(400,"Token is missing."));
    }
     
    const decodedToken = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
     
    const user = await User.findById(decodedToken.userId);
   
    if (!user) {
      return next(new ApiError(400, "Invalid token"));
    }
    
    if(!newPassword?.trim() || newPassword.trim().length<6){
       return next(new ApiError(400,"Password is missing or password length should be at least 6 characters."))
    }
 
    user.password = newPassword?.trim();
    await user.save();

    res.status(200).json(new ApiResponse(200, "Password reset successfully", null));
   
});

 
const getCurrentUser= (req,res)=>{
   return res.status(200).json(new ApiResponse(200,"current user fetched successfully",req.user))
};


const updateEmail = asyncHandler(async(req, res,next) => {
   const {email} = req.body

   if (!email?.trim()) {
       return next( new ApiError(400, "email is required"));
   }

   if (!emailRegex.test(email)) {
    return next(new ApiError(400, "Invalid email format."));
    }

    if (!email.includes("@gmail.com")) {
    return next(new ApiError(400, "The email must be from Gmail domain (@gmail.com)."));
    } 

   const user = await User.findByIdAndUpdate(
       req.user?._id,
       {
           $set:{email:email?.trim()}
       },
       {new: true}
       
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200,"Account details updated successfully", user))
});


const updateUserAvatar = asyncHandler(async (req, res, next) => {
   const avatarLocalPath = req.file?.path;
     if (!avatarLocalPath) {
     return next(new ApiError(400, "Avatar file is missing"));
   }
   
   if(req.file?.mimetype.includes("video")){
    
    fs.unlinkSync(avatarLocalPath);
    return next(new ApiError(400,"Please provide only an image file for the avatar field."))
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath,"avatars");
 
   if (!avatar.url) {
     return next(new ApiError(500, "Failed to upload the avatar image. Please try again later."));
   }
   
   const publicId=getPublicIdFromUrl(req.user?.avatar)
   const deleteResult=await deleteMediaFileFromCloudinary(publicId);
   
   if (!deleteResult || deleteResult.result != 'ok') {
    return next(new ApiError(500, "Failed to remove avatar image. Please try again later"));
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
       "Avatar image updated successfully",
       {user}
     )
   );
 });
 

const updateUserCoverImage = asyncHandler(async(req, res,next) => {

   const coverImageLocalPath = req.file?.path

   if (!coverImageLocalPath) {
      return next(new ApiError(400, "Cover image file is missing"))
   }

   if(req.file?.mimetype.includes("video")){
    
    fs.unlinkSync(coverImageLocalPath);
    return next(new ApiError(400,"Please provide only an image file for coverImage field.."))
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath,"coverImages")

   if (!coverImage?.url) {
       return next(new ApiError(500, "Failde to upload the coverImage.Please try again later."))
   }
   if(req.user?.coverImage?.trim()){
    
    const coverImagePublicId= getPublicIdFromUrl(req.user?.coverImage)
    const deleteResult=await deleteMediaFileFromCloudinary(coverImagePublicId)

    if(!deleteResult && deleteResult !='ok'){
      return next(new ApiError(500,"Failed to remove coverImage from the cloudinary."))
     }

   }
    
   const user = await User.findByIdAndUpdate(
       req.user?._id, 
       {
           $set:{ coverImage: coverImage?.url  }
       },
       {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(
       new ApiResponse(200, user, "Cover image updated successfully")
   )
});

 

const getUserChannelProfile = asyncHandler(async(req, res,next) => {
  
   const {username} = req.params

   if (!username?.trim()) {
       return next(new ApiError(400, "username is missing"))
   }
   //if(!username || !username.trim()){}

   const channel = await User.aggregate([

   
       {
           $match: {
               userName: username?.toLowerCase()
           }
       },
       {
           $lookup: {
               from: "subscriptions",
               localField: "_id",
               foreignField: "channel",
               as: "subscribers"
           }
       },
       {
           $lookup: {
               from: "subscriptions",
               localField: "_id",
               foreignField: "subscriber",
               as: "subscribedTo"
           }
       },
       {
           $addFields: {
               subscribersCount: {
                   $size: "$subscribers"
               },
               channelsSubscribedToCount: {
                   $size: "$subscribedTo"
               },
               isSubscribed: {
                   $cond: {
                       if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                       then: true,
                       else: false
                   }
               }
           }
       },
       {
           $project: {
               fullName: 1,
               username: 1,
               subscribersCount: 1,
               channelsSubscribedToCount: 1,
               isSubscribed: 1,
               avatar: 1,
               coverImage: 1,
               email: 1

           }
       }
   ])

   if (!channel?.length) {
       return next( new ApiError(404, "channel does not exists"))
   }

   return res
   .status(200)
   .json(
       new ApiResponse(200, channel[0], "User channel fetched successfully")
   )
})


// const getUserWatchHistory=asyncHandler(async(req,res,next)=>{

//   const user = await User.aggregate([
//     {
//         $match: {
//             _id: new mongoose.Types.ObjectId(req.user._id)
//         }
//     }, 
//     {
//         $lookup: {
//             from: "videos",
//             localField: "watchHistory",
//             foreignField: "_id",
//             as: "watchHistory",
//             pipeline: [
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "owner",
//                         foreignField: "_id",
//                         as: "owner",
//                         pipeline: [
//                             {
//                                 $project: {
//                                     fullName: 1,
//                                     username: 1,
//                                     avatar: 1
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $addFields:{
//                         owner:{
//                             $first: "$owner"
//                         }
//                     }
//                 }
//             ]
//         }
//     }
// ])
//   res.status(200).json(user);
// })
  const getUserWatchHistory=asyncHandler(async(req,res,next)=>{

  const user = await User.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchedVideos',
      },
    },
  
    {
      $lookup: {
        from: 'users',
        localField: 'watchedVideos.owner',
        foreignField: '_id',
        as: 'video-owner-details',
      },
    },
   {$unwind:"$video-owner-details"},
    {
      $project: {
        _id: 1,
        userName: 1,
        email: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        'watchedVideos._id': 1,
        'watchedVideos.videoFile': 1,
        'watchedVideos.thumbnail': 1,
        'watchedVideos.title': 1,
        'watchedVideos.description': 1,
        'watchedVideos.duration': 1,
        'watchedVideos.views': 1,
        'watchedVideos.isPublished': 1,
        'watchedVideos.owner':{
          'video-owner-details._id':'$video-owner-details._id',
          'video-owner-details.fullName': "$video-owner-details.fullName",
          'video-owner-details.avatar': "$video-owner-details.avatar",
        }
      
      },
    },
])
  res.status(200).json(new ApiResponse(200,"ftched successfully.",user));
})

// const getUserWatchHistory=asyncHandler(async(req,res,next)=>{

//   const pipeLine=[
//     {
//       '$match': {
//         '_id': new mongoose.Types.ObjectId(req.user?._id)
//       }
//     }, {
//       '$lookup': {
//         'from': 'videos', 
//         'localField': 'watchHistory', 
//         'foreignField': '_id', 
//         'as': 'watchedVideos'
//       }
//     }
//     , {
//       '$project': {
//         '_id': 1, 
//         'userName': 1, 
//         'email': 1, 
//         'fullName': 1, 
//         'avatar': 1, 
//         'coverImage': 1, 
//         'watchedVideos': {
//           '_id': 1, 
//           'videoFile': 1, 
//           'thumbnail': 1, 
//           'title': 1, 
//           'description': 1, 
//           'duration': 1, 
//           'views': 1, 
//           'isPublished': 1, 
//           'owner': 1, 
//           'createdAt': 1, 
//           'updatedAt': 1
//         }, 
//         'createdAt': 1, 
//         'updatedAt': 1
//       }
//     }
//   ]
//   const user=await User.aggregate(pipeLine)
//   res.status(200).json(user);
// })

module.exports={
   registerUser,
   loginUser,
   logoutUser,
   getCurrentUser,
   changeCurrentPassword,
   getCurrentUser,
   updateEmail,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   forgotPassword,
   resetPassword,
   getUserWatchHistory
}