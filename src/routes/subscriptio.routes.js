const { Router } = require('express');
const router = Router();
const {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels}=require("../controllers/subscription.controller")
const { verifyJWT } = require('../middlewares/auth.middleware.js');

router.use(verifyJWT);
 
router.route('/channel/:channelId').post(toggleSubscription);
router.route('/user/:channelId').get(getUserChannelSubscribers);
router.route('/channel/:subscriberId').get(getSubscribedChannels);

module.exports = router; 
