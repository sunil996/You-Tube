const { Router }=require('express');
const {createTweet,getUserTweets,updateTweet,deleteTweet}=require("../controllers/tweet.controller.js");
const  {verifyJWT} =require( "../middlewares/auth.middleware.js");

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/createTweet").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet)
router.route("/:tweetId").delete(deleteTweet);

module.exports=router;