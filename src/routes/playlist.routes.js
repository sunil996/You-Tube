const { Router } = require('express');
const {  createPlaylist,getUserPlaylists,getPlaylistById,updatePlaylist,deletePlaylist,addVideoToPlaylist,removeVideoFromPlaylist } = require('../controllers/playlist.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verifyJWT);  

router.route('/').post(createPlaylist);
router.route('/user/:userId').get(getUserPlaylists);

router.route("/:playlistId").get(getPlaylistById)
router.route("/:playlistId").patch(updatePlaylist)
router.route("/:playlistId").delete(deletePlaylist);

router.route('/addVideo').patch(addVideoToPlaylist); 
router.route('/removeVideo').patch(removeVideoFromPlaylist);

module.exports = router; 