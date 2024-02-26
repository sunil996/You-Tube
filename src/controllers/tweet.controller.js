const mongoose = require("mongoose");   
const { ApiError } = require("../utils/ApiError.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { asyncHandler } = require("../utils/asyncHandler.js");   
const Tweet=require("../models/tweet.model.js");

const createTweet = asyncHandler(async (req, res,next) => {
     
    const {content}=req.body;

    if(!content?.trim()){
        return next(new ApiError(400,"required to provide content."));
    }

    const tweet= await Tweet.create({content:content?.trim(),owner:req.user?._id})
    if(!tweet){
        return next(new ApiError(500,"Failed to create a tweet."));
    }  

    return res.status(201).json(new ApiResponse(201,"tweet created successfully.",tweet))
})

const getUserTweets = asyncHandler(async (req, res,next) => {
    
    const {userId} = req.params;
     console.log(userId)
    if(!userId?.trim()){
        return next(new ApiError(400,"User ID is required"))
    }
    if (mongoose.isValidObjectId(userId) === false) {
         next( new ApiError(400, 'User ID is not valid'))
    }

    const tweets=await Tweet.find({owner:userId});
    if (!tweets || tweets.length === 0) {
        return res.status(404).json(new ApiResponse(404, "No tweets found for the user.", []));
    }
    return res.status(200).json(new ApiResponse(200, "User tweets retrieved successfully.", tweets));
})

const updateTweet = asyncHandler(async (req, res,next) => {
    
    const {tweetId}=req.params; 
    const {content}=req.body;
   
    if(!tweetId?.trim()){
        return next(new ApiError(400,"did not get tweet id."))
    }

    if (mongoose.isValidObjectId(tweetId) === false) {
        return next( new ApiError(400, 'Tweet ID is not valid'));
    }

    if(!content?.trim()){
        return next(new ApiError(400,"required to provide content."));
    }
    
    const tweet= await Tweet.findById({_id:tweetId})

    if(!tweet){
        return next(new ApiError(404,"tweet not found."));
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "Forbidden: You do not have permission to update this tweet."));
    }
 
    tweet.content=content?.trim();
    const updatedTweet=await tweet.save();
    if(!updatedTweet){
        return next(new ApiError(500,"failded to updated the tweet.!"))
    }
    
    return res.status(200).json(new ApiResponse(200,"tweet updated successfully.",updatedTweet))

})

const deleteTweet = asyncHandler(async (req, res,next) => {

    const {tweetId}=req.params;
    if(!tweetId?.trim()){
        return next(new ApiError(400, "Did not get a valid twitt id."));
    }
   
    const tweet = await Tweet.findById({ _id: tweetId });
    if (!tweet) {
        return next(new ApiError(404, "tweet not found.!"));
    }

     if (tweet.owner.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "Forbidden: You do not have permission to delete this tweet."));
    }

   const deletedTweet=await tweet.delete();
   if(!deletedTweet){
    return next(new ApiError(500,"Failed to delete the tweet.try again later."));
   }

  res.status(200).json(new ApiResponse(200,"tweet deleted successfully.",nulll))
})

module.exports= {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}

