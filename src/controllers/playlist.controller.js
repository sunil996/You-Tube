const mongoose = require('mongoose');
const { Playlist } = require('../models/playlist.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const {Video}=require("../models/video.model.js")


const createPlaylist = asyncHandler(async (req, res,next) => {

    const {name} = req.body;
    
    if(!name?.trim()){
        return next(new ApiError(400,"playlist name is required."))
    }

    const playlist = await Playlist.create({
        name:name?.trim(),
        owner: req.user?._id
    });

    if (!playlist) {
         return next( new ApiError(500, 'Failed to create playlist'));
    }
   
    const responsePlaylist = {
        name: playlist.name,
        videos: playlist.videos,
        owner: playlist.owner,
        _id: playlist._id,
    };

    res.status(201).json(new ApiResponse(201,"playlist create successfully.", responsePlaylist))

});

//get User Playlist
const getUserPlaylists = asyncHandler(async (req, res,next) => {
 
    const { userId } = req.params;
   
    if(!userId?.trim()){
     return next(new ApiResponse(400,"userId is required to provide.!"))
    }

    if (mongoose.isValidObjectId(userId) === false) {
        return next( new ApiError(400,"user id is not valid"))
    }

    const playlists=await Playlist.find({owner:userId})

    if (!playlists) {
         return next( new ApiError(404, 'No playlists found'))
    }

    return res.status(200).json(new ApiResponse(200,"user playlist fetched successfully.",playlists))
})

//get particular playlist
const getPlaylistById = asyncHandler(async (req, res,next) => {

    const {playlistId} = req.params;
   
    if(!playlistId?.trim()){
     return next(new ApiResponse(400,"playlistId is required to provide.!"))
    }

    if (mongoose.isValidObjectId(playlistId) === false) {
        return next( new ApiError(400,"playlistId is not valid"))
    }

    const playlistData=await Playlist.findById(playlistId);

    if (!playlistData) {
        return next( new ApiError(404, 'No playlists found'))
   }

   return res.status(200).json(new ApiResponse(200,"playlist retrieved successfully.",playlistData))
});

//add video to the playlist.
const addVideoToPlaylist = asyncHandler(async (req, res,next) => {

    const {playlistId, videoId} = req.body;
    const {userId}=req.user?._id;

    if(!playlistId?.trim() || !videoId?.trim()){
        return next( new ApiError(400, 'playlist or video id coundn\'t found'));
    }

    if (mongoose.isValidObjectId(playlistId) === false  || mongoose.isValidObjectId(videoId) === false) {
       return next( new ApiError(400,"playlist  or video id not valid. "))
    }
    
    const isVideoExist=await Video.findOne({_id:videoId})
    if(!isVideoExist){
        return next(new ApiResponse(404,"video not exist.!"))
    }

    const userHasPermission = await Playlist.findOne({ _id: playlistId, owner: userId });

    if(!userHasPermission){
        
        return next(new ApiResponse(404,"Playlist not found or you don\'t have permission to add video in this playlist."))
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { 
            $addToSet: {videos: videoId } 
        },
        { new: true }
    );
    
    if (!updatedPlaylist) {
        return next(new ApiError(404, 'Playlist not found.'));
    }

    res.status(200).json(new ApiResponse(200, 'Video added to playlist successfully.', updatedPlaylist));

})

//remove the video from the playlist.
const removeVideoFromPlaylist=asyncHandler(async(req,res,next)=>{

    const {playlistId, videoId} = req.body;
    const {userId}=req.user?._id;

    if(!playlistId?.trim() || !videoId?.trim()){
        return next( new ApiError(400, 'playlist or video id coundn\'t found'));
    }

    if (mongoose.isValidObjectId(playlistId) === false  || mongoose.isValidObjectId(videoId) === false) {
       return next( new ApiError(400,"playlist  or video id not valid. "))
    }

    const userHasPermission = await Playlist.exists({ _id: playlistId, owner: userId });

    if (!userHasPermission) {
        return next(new ApiError(403, "Permission denied. User does not have the right to modify this playlist."));
    }

    const updatedPlaylist=await Playlist.findOneAndUpdate(
        {_id:playlistId},
        {$pull:{videos:videoId}},
        {new:true});

        if (!updatedPlaylist) {
            return next(new ApiError(404, " Playlist not found."));
        }    

    res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully.", updatedPlaylist));
})

//delete the playlist.
const deletePlaylist = asyncHandler(async (req, res,next) => {

    const {playlistId} = req.params;
    const {userId}=req.user?._id;

    if (!playlistId?.trim()) {
        throw new ApiError(400, 'Playlist ID is required');
    }

    if (!isValidObjectId(playlistId)) {
        return next(new ApiError(400, 'Invalid playlist ID')) ;
    }
    if (mongoose.isValidObjectId(playlistId) === false ) {
        return next( new ApiError(400," playlist id is not valid. "))
     }

    const userHasPermission = await Playlist.findOne({ _id: playlistId, owner: userId });

    if (!userHasPermission) {
        return next(new ApiError(403, 'Permission denied. User does not have the right to delete this playlist.'));
    }
    
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        return next(new ApiError(500, "failed to delete this playlist.!"));
    }

    return res.status(200).json(new ApiResponse(200,'Playlist deleted successfully',null ));
});

//update the playlist
const updatePlaylist = asyncHandler(async (req, res,next) => {

    const {playlistId} = req.params;
    const {name} = req.body;

    if (!playlistId?.trim()) {
        return next(new ApiError(400, 'Playlist ID is required'));
    }
    
    if(!name?.trim()){
        return next(new ApiError(400,'required to provide the name of playlist.'))
    }

    if (mongoose.isValidObjectId(playlistId)==false) {
        return next(new ApiError(400, 'Invalid playlist ID'));
    }
    
    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

    if (!playlist) {
        return next(new ApiError(403, 'Permission denied. User does not have the right to update this playlist.'));
    }

    if (name) {
        playlist.name = name.trim();
    }

    const updatedPlaylist = await playlist.save();
    res.status(200).json(new ApiResponse(200,'Playlist updated successfully', updatedPlaylist));
})


module.exports = { createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist ,removeVideoFromPlaylist,deletePlaylist,updatePlaylist};