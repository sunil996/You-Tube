const express = require('express');
const { Router } = require('express');
const  { addComment, deleteComment, getVideoComments, updateComment } = require('../controllers/comment.controller.js')
const  { verifyJWT } = require('../middlewares/auth.middleware.js');

const router = express.Router();
router.use(verifyJWT);

router.route('/:videoId').get(getVideoComments)
router.route('/:videoId').post(addComment);
router.route('/:commentId').patch(updateComment);
router.route('/:commentId').delete(deleteComment)


module.exports = router;    
