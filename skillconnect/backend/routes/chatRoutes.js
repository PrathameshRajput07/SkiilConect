// routes/chatRoutes.js — AI Support Chatbot endpoint
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAIResponse } = require("../controllers/messageController");

router.post("/", getAIResponse);

module.exports = router;
