const express = require('express');
const { getLikedVideos, toggleCommentLike, toggleVideoLike, toggleTweetLike } = require("../controllers/like.controller.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");
const router = express.Router();
router.use(verifyJWT);  

router.route("/toggle/video/:videoId").post(toggleVideoLike);
router.route("/toggle/comment/:commentId").post(toggleCommentLike);
router.route("/toggle/tweet/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

module.exports = router;