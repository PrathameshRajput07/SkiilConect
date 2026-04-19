// models/Job.js — Job posting model
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Who posted this job
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Job details
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: String, default: "" },
    responsibilities: { type: String, default: "" },

    // Company info (denormalized for display)
    company: { type: String, required: true },
    companyLogo: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    industry: { type: String, default: "" },

    // Location & work type
    location: { type: String, required: true },
    workType: { type: String, enum: ["remote", "onsite", "hybrid"], default: "onsite" },
    jobType: { type: String, enum: ["full-time", "part-time", "contract", "internship", "freelance"], default: "full-time" },

    // Compensation
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    salaryCurrency: { type: String, default: "USD" },
    salaryPeriod: { type: String, enum: ["yearly", "monthly", "hourly"], default: "yearly" },
    showSalary: { type: Boolean, default: true },

    // Skills required
    skills: [{ type: String }],
    experienceLevel: { type: String, enum: ["entry", "mid", "senior", "lead", "executive"], default: "mid" },
    experienceYears: { type: String, default: "" }, // e.g. "2-4 years"

    // Status
    status: { type: String, enum: ["active", "paused", "closed"], default: "active" },
    deadline: { type: Date },

    // Metrics
    views: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({ title: "text", description: "text", company: "text", skills: "text" });
jobSchema.index({ location: 1, status: 1 });
jobSchema.index({ employer: 1, createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
