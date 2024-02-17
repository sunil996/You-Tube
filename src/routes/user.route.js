const {Router}=require("express") ;
const {registerUser}=require("../controllers/user.controller.js")
const router=Router();

router.route("/register").get(registerUser);

module.exports=router;