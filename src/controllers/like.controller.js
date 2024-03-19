const mongoose = require("mongoose");
const { Like } = require("../models/like.model.js");
const { Comment} = require("../models/comment.model.js");
const { Video } = require("../models/video.model.js");
const Tweet = require("../models/tweet.model.js");
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");


const toggleVideoLike = asyncHandler(async (req, res,next) => {

    const { videoId } = req.params;
    
        if(!videoId?.trim()){
        return next(new ApiResponse(400,"video id is required to provide.!"))
       }
   
       if (mongoose.isValidObjectId(videoId) === false) {
           return next( new ApiError(400,"video id is not valid"))
       }
       
       const videoExist = await Video.exists({ _id: videoId.trim() });

        if (!videoExist) {
            return next(new ApiError(404, "Video not found."));
        }

       const likeExist=await Like.findOneAndDelete({video:videoId?.trim(),likedBy:req.user?._id});

       if(!likeExist){
 
        const newLike = await Like.create({
            video: videoId.trim(),
            likedBy: req.user?._id
        });
        
        res.status(200).json(new ApiResponse(200, "Like added successfully.", newLike));
        
       }else{

        res.status(200).json(new ApiResponse(200,"Like removed successfully..",null));
       }
});


//Alternative Approach
/*
const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    
        if(!videoId?.trim()){
        return next(new ApiResponse(400,"video id is required to provide.!"))
       }
   
       if (mongoose.isValidObjectId(videoId) === false) {
           return next( new ApiError(400,"video id is not valid"))
       }
       
       const videoExist = await Video.exists({ _id: videoId.trim() });

        if (!videoExist) {
            return next(new ApiError(404, "Video not found."));
        }

       const likeExist=await Like.findOne({video:videoId?.trim(),likedBy:req.user?._id});

       if(likeExist){

        const removeLike=await Like.deleteOne({video: videoId, likedBy:req.user?._id })
   
        if(removeLike.deletedCount !== 1){
            return next(new ApiError(500,"Failed to remove the like."));
        }
        res.status(200).json(new ApiResponse(200,"Like removed successfully..",removeLike));

       }else{
        
        const newLike = await Like.create({
            video: videoId.trim(),
            likedBy: req.user?._id
        });
        
        res.status(200).json(new ApiResponse(200, "Like added successfully.", newLike));
       }
    
});
*/

const toggleCommentLike = asyncHandler(async (req, res,next) => {

      const { commentId } = req.params;
    
        if(!commentId?.trim()){
            return next(new ApiResponse(400,"comment id is required to provide.!"))
        }
   
        if (mongoose.isValidObjectId(commentId?.trim()) === false) {
            return next( new ApiError(400,"comment id is not valid"))
        }
       
       const commentExist = await Comment.exists({ _id: commentId?.trim() });

        if (!commentExist) {
            return next(new ApiError(404, "comment not found."));
        }

       const likeExist=await Like.findOneAndDelete({comment:commentId?.trim(),likedBy:req.user?._id});

       if(!likeExist){
 
        const newLike = await Like.create({
            comment: commentId?.trim(),
            likedBy: req.user?._id
        });
        
        res.status(200).json(new ApiResponse(200, "liked  a comment successfully.", newLike));
    
       }else{
        
        res.status(200).json(new ApiResponse(200,"Like removed successfully.",null));
       }
   
});

const toggleTweetLike = asyncHandler(async (req, res,next) => {
    
    const { tweetId } = req.params;

    if (!tweetId?.trim()) {
        return next(new ApiResponse(400, "tweet id is required to provide.!"));
    }

    if (mongoose.isValidObjectId(tweetId?.trim()) === false) {
        return next(new ApiError(400, "tweet id is not valid"));
    }

    const tweetExist = await Tweet.exists({ _id: tweetId?.trim() });

    if (!tweetExist) {
        return next(new ApiError(404, "tweet not found."));
    }

    const likeExist = await Like.findOneAndDelete({ tweet: tweetId?.trim(), likedBy: req.user?._id });

    if (!likeExist) {
        const newLike = await Like.create({
            tweet: tweetId?.trim(),
            likedBy: req.user?._id
        });

    res.status(200).json(new ApiResponse(200, "liked a tweet successfully.", newLike));

    } else {
        res.status(200).json(new ApiResponse(200, "Like removed successfully.", null));
    }

});

const getLikedVideos = asyncHandler(async (req, res,next) => {

   const getUsersLikedVideos = await Like.find({
    likedBy: req.user?._id,
    video: { $exists: true }   
    }).populate("video").select("  -likedBy -createdAt -updatedAt  ");
    
    if (getUsersLikedVideos.length<1) {
        return next(new ApiError(404, "No liked videos found for the user."));
    }
 
    const likeCountResult = await Like.aggregate([

        {
           // $match: { likedBy:  new mongoose.Types.ObjectId(req.user?._id) ,$or:[{video:{$exists:true}},{tweet:{$exists:true} }] }
            $match: { likedBy:  new mongoose.Types.ObjectId(req.user?._id) ,video:{$exists:true} }
        },
        {
            $count: "countOfLikedVideos",
        }

    ]);
    
    const countOfLikedVideos = likeCountResult.length > 0 ? likeCountResult[0].countOfLikedVideos : 0;
    
    //return res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully.", {   getUsersLikedVideos }));
    return res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully.", { countOfLikedVideos, getUsersLikedVideos }));
      });

module.exports = {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
