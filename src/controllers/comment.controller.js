const mongoose = require('mongoose');
const { Comment } = require('../models/comment.model.js');
const { Video } = require('../models/video.model.js');
const { ApiError } = require('../utils/ApiError.js');
const { ApiResponse } = require('../utils/ApiResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

// const getVideoComments = asyncHandler(async (req, res,next) => {
//     //TODO: get all comments for a video
//     const { videoId } = req.params;
//     const { page = 1, limit = 10 } = req.query;
//     // Rest of the function implementation
    
//     if (!mongoose.Types.ObjectId.isValid(videoId?.trim())) {
//          return next( new ApiError(400,'provide valid video id. '));
//     }

//     const comments=await Comment.aggregate([

//      {
//         $match:{
//             video: new mongoose.Types.ObjectId(videoId)
//            },
//      },
//      {
//         $lookup:{
//             from:"users",
//             localField:"owner",
//             foreignField:"_id",
//             as: "userInformation"
//         }
//      },
//      {
//        $unwind:"$userInformation"
//      },
//      {
//         $project:{
         
//          _id:1,
//          content:1,
//          createdAt:1,
//          updatedAt:1,
//          userInformation:{
//             _id:1,
//             userName:1,
//             avatar:1

//          }
//         }
//      }
//     ])
    

//     return res.status(200).json(comments)
// });

const getVideoComments = asyncHandler(async (req, res, next) => {

        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;
  
            if (!mongoose.Types.ObjectId.isValid(videoId?.trim())) {
            return next( new ApiError(400,'provide valid video id. '));
            }

            const commentsData = await Comment.aggregate([
            {
                $match: {
                    video:new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                $sort: { createdAt: -1 }, // Sort by creation date, newest first
            },
            {
                $skip: (page - 1) * limit,  
            },
            {
                $limit: parseInt(limit),  
            },
            {
                $lookup: {
                    from: 'users',  
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    createdAt: 1,
                    user:{
                        _id:1,
                        userName:1,
                        avatar:1
                    }
                     
                }, 
            }
        ]);

        const commentCountResult = await Comment.aggregate([
          {
                 $match: {  video: new mongoose.Types.ObjectId(videoId)  },
          },
          {
                 $count:"totalComment"
          }
       
         ]);
         
        if(commentsData.length==0){
            return next(new ApiError(404,"comments not found"))
        } 
         
        let totalComments=commentCountResult[0].totalComment;
        return res.status(200).json(new ApiResponse(200, 'Video comments fetched successfully.',{totalComments , commentsData}));
 });
 
const addComment = asyncHandler(async (req, res,next) => {
     
    const {videoId} = req.params;
    const {content} = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId?.trim())) {
         return next( new ApiError(400,'Invalid videoId format'));
    }

    const video=await Video.findById(videoId?.trim());

    if(!video){
        return next(new ApiError(404,"video not found."))
    }

    if (!content?.trim()) {
        return next( new ApiError(400,'Content is required'));
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
    const userId=req.user?._id;
    
    if (!commentId?.trim()) {
        return next( new ApiError(400,'CommentId is required'));
    }
   
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
         return next( new ApiError(400,'Invalid comment id format'));
    }
    
    const comment = await Comment.findOne({ _id: commentId, owner: userId });
    
    if (!comment) { 
        return next(new ApiError(403, 'comment not found or you don\'t have right Permission  to update this comment.'));
    } 

    if ( content?.trim().length > 0) {
        comment.content = content.trim();
    } else {
        return next(new ApiError(400, 'content is required'));
    }
  
    const updatedComment=await comment.save();

    if (!updatedComment) {
        return next( new ApiError(500,'Failed to edit this comment !'));
    }

    return res.status(200).json(new ApiResponse(200,'Comment edited successfully',updatedComment));
});

const deleteComment = asyncHandler(async (req, res,next) => {

    const {commentId} = req.params;
    const userId=req.user?._id;

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
