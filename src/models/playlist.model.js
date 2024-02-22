const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true})

const Playlist = mongoose.model("Playlist", playlistSchema)
module.exports={Playlist}