const {Router}=require("express") ;
const {verifyJWT}=require("../middlewares/auth.middleware")
const {registerUser,loginUser,logoutUser}=require("../controllers/user.controller.js");
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
    router.route("/logout").post(verifyJWT,logoutUser)
module.exports=router;