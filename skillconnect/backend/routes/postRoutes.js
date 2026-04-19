// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { uploadPostImage } = require("../config/cloudinary");
const { createPost, getFeed, toggleLike, addComment, deletePost } = require("../controllers/postController");

router.get("/", protect, getFeed);
router.post("/", protect, uploadPostImage.single("image"), createPost);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.delete("/:id", protect, deletePost);

module.exports = router;
