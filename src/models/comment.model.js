const { Schema } = require("mongoose");
const mongoose=require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");


const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

 
const Comment = mongoose.model("Comment", commentSchema);

 module.exports={Comment}