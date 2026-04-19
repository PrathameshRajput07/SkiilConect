// models/User.js — User profile synced with Clerk authentication
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Clerk user ID — primary key for auth sync
    clerkId: { type: String, required: true, unique: true, index: true },

    // Basic info
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    profilePhoto: { type: String, default: "" }, // Cloudinary URL

    // Role: job_seeker or employer
    role: { type: String, enum: ["job_seeker", "employer", ""], default: "" },

    // Profile details (job seeker)
    headline: { type: String, default: "", maxlength: 220 }, // "Frontend Developer | React"
    about: { type: String, default: "", maxlength: 2600 },
    location: { type: String, default: "" },
    skills: [{ type: String }],
    resumeUrl: { type: String, default: "" }, // Uploaded resume PDF

    // Experience (job seeker)
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],

    // Education (job seeker)
    education: [
      {
        school: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        grade: String,
      },
    ],

    // Projects (job seeker)
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        link: String,
      },
    ],

    // Employer specific
    companyName: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companyDescription: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },

    // Social links
    linkedinUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },

    // Connections
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Saved jobs (job seeker)
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],

    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
