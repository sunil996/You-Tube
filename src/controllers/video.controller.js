const mongoose = require("mongoose");
const { isValidObjectId } = require("mongoose");
const { Video } = require("../models/video.model.js");
const { User } = require("../models/user.model.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { uploadOnCloudinary,deleteMediaFileFromCloudinary } = require("../utils/cloudinary.js");
const {getPublicIdFromUrl}=require("../utils/utilFunctions.js")
const fs=require("fs");

/*
const getAllVideos = asyncHandler(async (req, res) => {
    
    const getAllVideos = asyncHandler(async (req, res) => {
         
        const { page = 1, limit = 10, sortBy } = req.query;
          
          const pipeline = [];

    switch (sortBy) {
        case 'popular':
            pipeline.push({ $sort: { views: -1 } });
            break;
        case 'oldest':
            pipeline.push({ $sort: { createdAt: 1 } });
            break;
        case 'latest':
        default:
            pipeline.push({ $sort: { createdAt: -1 } });
            break;
    }

    pipeline.push({ $skip: (page - 1) * parseInt(limit, 10) });
    pipeline.push({ $limit: parseInt(limit, 10) });

    const videos = await Video.aggregate(pipeline);
        res.status(200).json(new ApiResponse(200,"videos fetched successfully.",videos));
    });
    

})
*/
const getAllVideos = asyncHandler(async (req, res) => {
     
    const { page = 1, limit = 10, sortBy } = req.query;
    let sortCriteria = {};
      
    switch (sortBy) {
        case 'popular':
            sortCriteria = { views: -1 };  
            break;
        case 'oldest':
            sortCriteria = { createdAt: 1 };  
            break;
        case 'latest':
            sortCriteria = { createdAt: -1 }; 
            break;
        default:
            sortCriteria = { createdAt: -1 };  
            break;
    }
 
    const videos = await Video.find({}).sort(sortCriteria).skip((page - 1) * limit).limit(limit);

    res.status(200).json(new ApiResponse(200,"videos fetched successfully.",videos));
})

const publishAVideo = asyncHandler(async (req, res,next) => {

    const { title, description} = req.body
    const videoLocalPath= req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path;
    
    if(!title?.trim() || !description?.trim())//if (!title || !description || !title.trim() || !description.trim())
    {
    
        if(videoLocalPath){
            fs.unlinkSync(videoLocalPath)
        }
        if(thumbnailLocalPath){
            fs.unlinkSync(thumbnailLocalPath)
        }
        
        return next(new ApiError(400,"title and Description are Required..."))
    }
   
    if(!videoLocalPath){
       
        if(thumbnailLocalPath){
            fs.unlinkSync(thumbnailLocalPath);
        }
        return next(new ApiError(400,"Video File is Required."))
    }

    if(!req.files?.videoFile?.[0]?.mimetype.includes("video")){

        fs.unlinkSync(videoLocalPath);

        if(thumbnailLocalPath){
            fs.unlinkSync(thumbnailLocalPath);
        }

        return next(new ApiError(400,"Please provide only a video file for videoFile field."))
    }

    if(!thumbnailLocalPath){
        
        fs.unlinkSync(videoLocalPath);
        return next(new ApiError(400,"Thumbnail is Required."))
    }

    if(!req.files?.thumbnail?.[0]?.mimetype.includes("image")){
      
        fs.unlinkSync(videoLocalPath)
        fs.unlinkSync(thumbnailLocalPath);
        return next(new ApiError(400,"Please provide only an image file for thumbnail.s."))
    }

     const video=await uploadOnCloudinary(videoLocalPath,"videos");
     if(!video){
        return next(500,"something went wrong while uploading video on cloudinary.")
     }

     const thumbnail=await uploadOnCloudinary(thumbnailLocalPath,"thumbnails");
     if(!thumbnail){
        return next(500,"something went wrong while uploading thumbnail on cloudinary.") 
     } 
    
     const  uploadVideo=await Video.create({
        videoFile:video.url,
        thumbnail:thumbnail.url,
        title:title?.trim(),
        description:description?.trim(),
        duration:video.duration,
        owner:req.user?._id
     })
     
     if (!uploadVideo) {
        return next(new ApiError(500, "Failed to Upload the Video."));
     }
     
     return res.status(201).json(new ApiResponse(201,"video Uploaded Successfully",uploadVideo))

})

const getVideoById = asyncHandler(async (req, res,next) => {

    const { videoId } = req.params

    if(!videoId?.trim()){
        return next(new ApiError(400,"did not get video id."))
    }
    
    if (mongoose.isValidObjectId(videoId) === false) {
        return next( new ApiError(400,"video id is not valid"))
    }

    const foundVideo=await Video.findById( videoId );
    
    if(!foundVideo){
        return next(new ApiError(404,"video not found !"))
    }

    foundVideo.views=foundVideo.views+1;
    
   const updatedUser= await User.findByIdAndUpdate(req.user?._id,{$addToSet:{watchHistory:foundVideo._id}},{new:true})
   const updatedVideo=await foundVideo.save();
   
    return res.status(200).json(new ApiResponse(200,"video fetched successfully.",updatedVideo))

})

const updateVideo = asyncHandler(async (req, res,next) => {
    const { videoId } = req.params;
    const {title,description}=req.body;
    const thumbnailLocalPath=req.file?.path;
    
    if(!videoId?.trim()){
        
        if(thumbnailLocalPath){
            fs.unlinkSync(thumbnailLocalPath)
        }
        return next(new ApiError(400,"did not get video id."))
    }
   
    const video=await Video.findById({_id:videoId});
    
    if(!video){
        return next(new ApiError(404,"video not found."));
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "Forbidden: You do not have permission to update this video."));
    }


    if(title?.trim()){
       video.title=title?.trim();
    }
    if(description?.trim()){
        video.description=description?.trim();
    }

    let thumbnail;
    if(thumbnailLocalPath){

         thumbnail=await uploadOnCloudinary(thumbnailLocalPath,"thumbnails");

          if(thumbnail){
            
            const thumbnailPublicId=getPublicIdFromUrl(video.thumbnail);
             const deleteResult = await deleteMediaFileFromCloudinary(thumbnailPublicId);

             if(!deleteResult || deleteResult.result !='okay' ){
                return next(new ApiError(500,"somehting went wrong while deleting thumbnail from the cloudinary."))
             }
          }
    }

    if(thumbnail){
        video.thumbnail=thumbnail.url;
    }
     
    const updatedVideo=await video.save();
    if(!updatedVideo){
        return next(new ApiError(500,"something went wrong while updating the video."))
    }
    console.log(updatedVideo);
    return res.status(200).json( new ApiResponse(200,"video Updated Successfully.",updatedVideo) )

});

const deleteVideo = asyncHandler(async (req, res,next) => {
    
        let { videoId } = req.params;
        videoId = videoId?.trim();
         
        if (!videoId) {
            return next(new ApiError(400, "Did not get a valid video id."));
        }

        const video = await Video.findById(videoId);
        
        if (!video) {
                return next(new ApiError(404, "video not found.!"));
        }
     
        if (video.owner.toString() !== req.user._id.toString()) {
            return next(new ApiError(403, "Forbidden: You do not have permission to delete this video."));
        }
       
        const  deletedVideo  =await Video.deleteOne({_id:videoId});

        if(deletedVideo.deletedCount !== 1){
            return next(new ApiError(500,"Failed to delete the video.try again later."));
        }

        const videoPublicId = getPublicIdFromUrl(video.videoFile); 
        const deletedVideoFromCloudinary  = await deleteMediaFileFromCloudinary(videoPublicId,"video");

        if (!deletedVideoFromCloudinary || deletedVideoFromCloudinary.result != 'ok') {
                return next(new ApiError(500, "Something went wrong while deleting video from Cloudinary."));
            }
        
       const thumbnailPublicId = getPublicIdFromUrl(video.thumbnail);
       const deletedThumbnail = await deleteMediaFileFromCloudinary(thumbnailPublicId,"image");

        if (!deletedThumbnail || deletedThumbnail.result != 'ok') {
            return next(new ApiError(500, "Something went wrong while deleting thumbnail from Cloudinary."));
        }
        
        return res.status(200).json(new ApiResponse(200, "Video deleted successfully.", null));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

module.exports= {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}