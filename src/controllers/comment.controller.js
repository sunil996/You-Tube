const mongoose = require('mongoose');
const { Comment } = require('../models/comment.model.js');
const { ApiError } = require('../utils/ApiError.js');
const { ApiResponse } = require('../utils/ApiResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

const getVideoComments = asyncHandler(async (req, res,next) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    // Rest of the function implementation
});

const addComment = asyncHandler(async (req, res,next) => {
     
    const {videoId} = req.params;
    const {content} = req.body;

    if (!content?.trim()) {
        return next( new ApiError(400,'Content is required'));
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
         return next( new ApiError(400,'Invalid videoId format'));
    }

    const comment = await Comment.create({
        content:content?.trim(),
        owner: req.user?._id,
        video: videoId,
    });

    if (!comment) {
        return next( new ApiError(500,'Failed to add comment !'));
    }

    return res.status(201).json(new ApiResponse(201,'Comment created successfully',comment));
});

const updateComment = asyncHandler(async (req, res,next) => {
    
    const {commentId} = req.params;
    const {content}=req.body;
    const {userId}=req.user?._id;

    if (!commentId?.trim()) {
        return next( new ApiError(400,'CommentId is required'));
    }
    if(!content?.trim()){
        return next( new ApiError(400,'Comment is required'));
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
         return next( new ApiError(400,'Invalid comment id format'));
    }

    const comment = await Comment.findOne({ _id: commentId, owner: userId });

    if (!comment) {
        return next(new ApiError(403, 'Permission denied. You don\'t have the right to update this comment.'));
    }

    if(content){
     comment.content=content?.trim();
    }

    const updatedComment=await comment.save();

    if (!updatedComment) {
        return next( new ApiError(500,'Failed to edit this comment !'));
    }

    return res.status(200).json(new ApiResponse(200,'Comment edited successfully',updatedComment));
});

const deleteComment = asyncHandler(async (req, res,next) => {

    const {commentId} = req.params;
    const {userId}=req.user?._id;

    if (!commentId?.trim() || !mongoose.Types.ObjectId.isValid(commentId)) {
        return next(new ApiError(400, 'Invalid comment id'));
    }
    
    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: userId,
    });

    if (!deletedComment) {
        return next(new ApiError(403, 'Permission denied or comment not found'));
    }

    return res.status(200).json(new ApiResponse(200,'Comment deleted successfully',deletedComment));
});

module.exports = {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
