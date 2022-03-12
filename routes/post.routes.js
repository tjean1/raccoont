const router = require('express').Router();
const postController = require('../controllers/post.controller');
const upload = require('../middlewares/multer-post.middleware');

// post DB
router.get('/', postController.readPost);
router.post('/', upload, postController.createPost);
router.post('/picture', upload, postController.createPostWithPicture);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.patch('/like-post/:id', postController.likePost);
router.patch('/unlike-post/:id', postController.unlikePost);

// comments
router.patch('/comment-post/:id', postController.commentPost);
router.patch('/edit-comment-post/:id', postController.editCommentPost);
router.patch('/delete-comment-post/:id', postController.deleteCommentPost);

module.exports = router;
