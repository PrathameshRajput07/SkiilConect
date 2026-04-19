// models/Application.js — Job application model
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Application content
    coverLetter: { type: String, default: "" },
    resumeUrl: { type: String, default: "" }, // URL to uploaded resume

    // Employer actions
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "interview", "offered", "rejected"],
      default: "pending",
    },
    employerNote: { type: String, default: "" }, // Internal note from employer

    // Timestamps for status changes
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ applicant: 1, createdAt: -1 });

const Application = mongoose.model("Application", applicationSchema);

// ─────────────────────────────────────────────────────────────

// models/Post.js — LinkedIn-style posts
const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 3000 },
    image: { type: String, default: "" }, // Cloudinary URL

    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Visibility
    visibility: { type: String, enum: ["public", "connections"], default: "public" },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

// ─────────────────────────────────────────────────────────────

// models/Message.js — Chat messages
const conversationSchema = new mongoose.Schema(
  {
    // Two participants in the conversation
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount: { type: Map, of: Number, default: {} }, // { userId: count }
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

// models/Notification.js — In-app notifications
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  triggerUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["like", "comment", "view"], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  text: { type: String }, // For comments or message previews
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Application, Post, Conversation, Message, Notification };
