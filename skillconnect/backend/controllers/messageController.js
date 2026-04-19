// controllers/messageController.js — Real-time chat persistence
const asyncHandler = require("express-async-handler");
const { Conversation, Message } = require("../models/index");
const User = require("../models/User");

// @desc  Get or create conversation with another user
// @route POST /api/messages/conversation
// @access Private
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) return res.status(400).json({ message: "recipientId required" });

  const recipient = await User.findById(recipientId);
  if (!recipient) return res.status(404).json({ message: "Recipient not found" });

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] },
  }).populate("participants", "firstName lastName profilePhoto headline role companyName");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
    });
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "firstName lastName profilePhoto headline role companyName");
  }

  res.json(conversation);
});

// @desc  Get all conversations for current user
// @route GET /api/messages/conversations
// @access Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "firstName lastName profilePhoto headline role companyName")
    .sort({ lastMessageAt: -1 })
    .lean();
  res.json(conversations);
});

// @desc  Get messages in a conversation
// @route GET /api/messages/:conversationId
// @access Private
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });

  // Ensure user is a participant
  if (!conversation.participants.includes(req.user._id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const messages = await Message.find({ conversation: req.params.conversationId })
    .populate("sender", "firstName lastName profilePhoto")
    .sort({ createdAt: 1 })
    .lean();

  // Mark messages as read
  await Message.updateMany(
    { conversation: req.params.conversationId, sender: { $ne: req.user._id }, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json(messages);
});

// @desc  Send a message (also persisted via REST for reliability)
// @route POST /api/messages/:conversationId
// @access Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Content required" });

  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });
  if (!conversation.participants.includes(req.user._id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const message = await Message.create({
    conversation: req.params.conversationId,
    sender: req.user._id,
    content,
  });

  // Update conversation last message
  await Conversation.findByIdAndUpdate(req.params.conversationId, {
    lastMessage: content.substring(0, 100),
    lastMessageAt: new Date(),
  });

  const populated = await Message.findById(message._id)
    .populate("sender", "firstName lastName profilePhoto")
    .lean();

  res.status(201).json(populated);
});

module.exports = { getOrCreateConversation, getConversations, getMessages, sendMessage };

// ─────────────────────────────────────────────────────────────

// controllers/chatController.js — AI Support Chatbot
const chatbotResponses = {
  resume: [
    "📝 **Resume Tips:**\n• Keep it to 1-2 pages\n• Use action verbs (Led, Built, Increased)\n• Quantify achievements (e.g., 'Increased sales by 40%')\n• Tailor your resume for each job application\n• Include relevant keywords from the job description",
    "💡 **Resume Sections to Include:**\n• Professional Summary (2-3 lines)\n• Work Experience (most recent first)\n• Education\n• Skills (technical + soft)\n• Projects (with links)\n• Certifications",
  ],
  jobSearch: [
    "🔍 **Job Search Strategy:**\n• Apply to 5-10 jobs per day for best results\n• Network — 70% of jobs are filled through connections\n• Follow target companies on SkillConnect\n• Set up job alerts for your preferred roles\n• Customize your application for each position",
    "🎯 **How to Stand Out:**\n• Write a personalized cover letter\n• Connect with the hiring manager on SkillConnect\n• Showcase projects and portfolio\n• Mention specific achievements in your summary",
  ],
  interview: [
    "🎤 **Interview Tips:**\n• Research the company thoroughly\n• Use the STAR method (Situation, Task, Action, Result)\n• Prepare 5 questions to ask the interviewer\n• Practice common questions out loud\n• Send a thank-you note within 24 hours",
  ],
  salary: [
    "💰 **Salary Negotiation:**\n• Always negotiate — 85% of employers expect it\n• Research market rates on Glassdoor/LinkedIn\n• Give a range, not a single number\n• Consider the full package (benefits, equity, flexibility)\n• Be confident and professional",
  ],
  default: [
    "👋 Hi! I'm your SkillConnect AI Assistant. I can help you with:\n\n• **Resume tips** — how to improve your resume\n• **Job search** — finding and applying to jobs\n• **Interview prep** — common questions and strategies\n• **Salary negotiation** — how to ask for what you deserve\n\nWhat would you like help with?",
  ],
};

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAIResponse = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are the SkillConnect AI Assistant. Help the user with career advice, resumes, job searches, and interviews. Keep responses concise and engaging." },
        { role: "user", content: message }
      ],
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    if (error.status === 401 || !process.env.OPENAI_API_KEY) {
      // Fallback to mock logic if OpenAI key is invalid or unauthorized
      const lower = message.toLowerCase();
      let response;
      if (lower.includes("resume") || lower.includes("cv")) {
        response = chatbotResponses.resume[Math.floor(Math.random() * chatbotResponses.resume.length)];
      } else if (lower.includes("job") || lower.includes("apply") || lower.includes("search")) {
        response = chatbotResponses.jobSearch[Math.floor(Math.random() * chatbotResponses.jobSearch.length)];
      } else if (lower.includes("interview")) {
        response = chatbotResponses.interview[0];
      } else if (lower.includes("salary") || lower.includes("pay") || lower.includes("negotiat")) {
        response = chatbotResponses.salary[0];
      } else {
        response = chatbotResponses.default[0];
      }
      return res.json({ response });
    }
    console.error("OpenAI Error:", error);
    res.status(500).json({ message: "AI Assistant is currently unavailable" });
  }
});

module.exports.getAIResponse = getAIResponse;
