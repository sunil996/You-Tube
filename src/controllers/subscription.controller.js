const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const { User } = require('../models/user.model.js');
const { Subscription } = require('../models/subscription.model.js');
const { ApiError } = require('../utils/ApiError.js');
const { ApiResponse } = require('../utils/ApiResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

const toggleSubscription = asyncHandler(async (req, res,next) => {

    const { channelId } = req.params;
    if (!channelId) {
        return next(new ApiError(400, 'Channel id is required'));
    }

    if (mongoose.isValidObjectId(channelId) === false) {
        return next( new ApiError(400, 'Channel id is not valid'));
    }

    const channelExists = await User.exists({ _id: channelId });
    if (!channelExists) {
        return next( new ApiError(404, 'Channel not found'));
    }

    const isSubscribed= await Subscription.exists({subscriber: req.user?._id,channel: channelId});
    
    if(isSubscribed){

    const deleteSubscription=await Subscription.deleteOne({subscriber: req.user?._id, channel: channelId})
   
    if(deleteSubscription.deletedCount !== 1){
        return next(new ApiError(500,"failed to unscribe"));
    }
    res.status(200).json(new ApiResponse(200,"unsubscribed successfully.",deleteSubscription));
    
  }else{

    const newSubscription = await Subscription.create({subscriber:req.user?._id,channel:channelId});
    if (!newSubscription) {
        return next(new ApiError(500, 'Failed to subscibe this channel'))
    }
    return res.status(201).json(new ApiResponse(201,"channel subscibed successfully",newSubscription))
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res,next) => {

    const { channelId } = req.params;

    if (!channelId) {
        return next(new ApiError(400, 'channel  id is required'));
    }

    if (mongoose.isValidObjectId(channelId) === false) {
        return next( new ApiError(400, 'channel id is not valid.'));
    }

    const getSubscribersOfChannel=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"channelSubscribers"
            }
        },
        {
            $unwind:"$channelSubscribers"
        },
        {
            $project:{
                _id:0,
                channelSubscribers:{

                        _id: 1,
                        avatar: 1,
                        userName: 1,
                        coverImage: 1,
                        subscriberName: '$channelSubscribers.fullName'
                }
            }
        }
    ])
    res.status(200).json(new ApiResponse(200,"fetched subscribed channel successfully.",getSubscribersOfChannel))

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res,next) => {

    const { subscriberId } = req.params;
    
    if (!subscriberId?.trim()) {
        return next(new ApiError(400, 'Subsciber  id is required'));
    }

    if (mongoose.isValidObjectId(subscriberId) === false) {
        return next( new ApiError(400, 'Subscriber id is not valid'));
    }

    const SubscribedChannels = await Subscription.aggregate([

        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }                                                                                   
        },
        {
            $lookup:{
                
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedChannel"
            }
        },
           {
               $unwind: '$subscribedChannel',
            },
        {
            $project:{
                    _id:0,
                    subscribedChannel:{
                        _id: 1,
                        avatar: 1,
                        userName: 1,
                        coverImage: 1,
                        channelName: '$subscribedChannel.fullName',
                    }
            }
        }
    ])

    console.log(SubscribedChannels)
    res.status(200).json(new ApiResponse(200,"fetched subscribed channel successfully.",SubscribedChannels))


});

module.exports = {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
