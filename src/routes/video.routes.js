const {Router}=require("express") ;
const {verifyJWT}=require("../middlewares/auth.middleware")
const { upload } = require("../middlewares/multer.midleware.js");
const {publishAVideo, getVideoById,updateVideo,deleteVideo}=require("../controllers/video.controller");


const router=Router();
router.use(verifyJWT); 

router.route("/publishAVideo")
.post(upload.fields([
    {
    name:"videoFile",
    maxCount:1
    },
    {
     name:"thumbnail",
     maxCount:1
    }
    ]),
    publishAVideo);
     
    router.route("/:videoId").get(getVideoById);
    router.route("/:videoId").delete(deleteVideo);
    router.route("/:videoId").put(upload.single("thumbnail"),updateVideo);
    
module.exports=router;