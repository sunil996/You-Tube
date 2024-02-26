const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})


const Tweet = mongoose.model("Tweet", tweetSchema);
module.exports=Tweet;