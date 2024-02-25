const {Router}=require("express") ;
const {verifyJWT}=require("../middlewares/auth.middleware")
const {registerUser,loginUser,logoutUser,changeCurrentPassword,getCurrentUser,updateEmail,updateUserAvatar,updateUserCoverImage,getUserChannelProfile}=require("../controllers/user.controller.js");
const { upload } = require("../middlewares/multer.midleware.js");
const router=Router();


  router.route("/register").post(
    upload.fields([
      {
        name: "avatar",
        maxCount: 1
      },
      {
        name: "coverImage",
        maxCount: 1,
      }
    ]),
    registerUser
  );

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-email").patch(verifyJWT, updateEmail)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)// next work-- add this in postman.

module.exports=router;