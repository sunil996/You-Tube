const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, {timestamps: true});
 
 const Subscription =mongoose.model("Subscription", subscriptionSchema)
 module.exports={ Subscription }
 