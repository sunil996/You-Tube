const {Router}=require("express") ;
const {verifyJWT}=require("../middlewares/auth.middleware")
const {registerUser,loginUser,logoutUser,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile}=require("../controllers/user.controller.js");
const { upload } = require("../middlewares/multer.midleware.js");
const router=Router();

router.route("/register")
.post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),registerUser);

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)

module.exports=router;