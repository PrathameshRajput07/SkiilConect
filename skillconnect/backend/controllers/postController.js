// controllers/postController.js — LinkedIn-style posts
const asyncHandler = require("express-async-handler");
const { Post } = require("../models/index");

// @desc  Create post
// @route POST /api/posts
// @access Private
const createPost = asyncHandler(async (req, res) => {
  const { content, visibility } = req.body;
  if (!content) return res.status(400).json({ message: "Content is required" });

  const post = await Post.create({
    author: req.user._id,
    content,
    image: req.file ? req.file.path : "",
    visibility: visibility || "public",
  });

  const populated = await Post.findById(post._id)
    .populate("author", "firstName lastName profilePhoto headline role companyName")
    .lean();

  res.status(201).json(populated);
});

// @desc  Get all posts (feed)
// @route GET /api/posts
// @access Private
const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const posts = await Post.find({ visibility: "public" })
    .populate("author", "firstName lastName profilePhoto headline role companyName")
    .populate("comments.user", "firstName lastName profilePhoto")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Post.countDocuments({ visibility: "public" });
  res.json({ posts, total, page: Number(page) });
});

// @desc  Like / unlike a post
// @route PUT /api/posts/:id/like
// @access Private
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const idx = post.likes.indexOf(req.user._id);
  if (idx > -1) {
    post.likes.splice(idx, 1); // Unlike
  } else {
    post.likes.push(req.user._id); // Like
    
    // Automatically flag notification for author
    if (post.author.toString() !== req.user._id.toString()) {
      const { Notification } = require("../models/index");
      await Notification.create({
        recipient: post.author,
        triggerUser: req.user._id,
        action: "like",
        post: post._id
      });
    }
  }
  await post.save();
  res.json({ likes: post.likes.length, liked: idx === -1 });
});

// @desc  Add comment
// @route POST /api/posts/:id/comments
// @access Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Comment text required" });

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.comments.push({ user: req.user._id, text });
  await post.save();

  // Automatically flag notification for author
  if (post.author.toString() !== req.user._id.toString()) {
    const { Notification } = require("../models/index");
    await Notification.create({
      recipient: post.author,
      triggerUser: req.user._id,
      action: "comment",
      post: post._id,
      text: text
    });
  }

  const updated = await Post.findById(req.params.id)
    .populate("comments.user", "firstName lastName profilePhoto")
    .lean();

  res.json(updated.comments);
});

// @desc  Delete post
// @route DELETE /api/posts/:id
// @access Private (author only)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  await post.deleteOne();
  res.json({ message: "Post deleted" });
});

module.exports = { createPost, getFeed, toggleLike, addComment, deletePost };
