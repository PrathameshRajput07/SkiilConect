// controllers/applicationController.js
const asyncHandler = require("express-async-handler");
const { Application } = require("../models/index");
const Job = require("../models/Job");

// @desc  Apply to a job
// @route POST /api/applications
// @access Private (job_seeker)
const applyToJob = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, resumeUrl } = req.body;

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.status !== "active") return res.status(400).json({ message: "This job is no longer accepting applications" });

  // Check for duplicate application
  const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
  if (existing) return res.status(400).json({ message: "You have already applied to this job" });

  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    employer: job.employer,
    coverLetter: coverLetter || "",
    resumeUrl: resumeUrl || req.user.resumeUrl || "",
    statusHistory: [{ status: "pending", note: "Application submitted" }],
  });

  // Increment application count on job
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

  // Automatically start a Conversation and send the Resume to the recruiter
  const { Conversation, Message } = require("../models/index");
  let conv = await Conversation.findOne({
    participants: { $all: [req.user._id, job.employer] }
  });
  if (!conv) {
    conv = await Conversation.create({
      participants: [req.user._id, job.employer]
    });
  }
  
  const msgText = `Hi, I have applied for the position: "${job.title}".\n${resumeUrl || req.user.resumeUrl ? `Here is the link to my resume: ${resumeUrl || req.user.resumeUrl}` : 'I have not attached a resume.'}\n${coverLetter ? `Cover Letter:\n${coverLetter}` : ''}`;
  
  await Message.create({
    conversation: conv._id,
    sender: req.user._id,
    content: msgText
  });
  conv.lastMessage = "Sent a job application and resume.";
  conv.lastMessageAt = Date.now();
  await conv.save();

  res.status(201).json(application);
});

// @desc  Get my applications (job seeker)
// @route GET /api/applications/my
// @access Private (job_seeker)
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("job", "title company location workType salaryMin salaryMax status")
    .populate("employer", "firstName lastName companyName profilePhoto")
    .sort({ createdAt: -1 })
    .lean();
  res.json(applications);
});

// @desc  Get applicants for a job (employer)
// @route GET /api/applications/job/:jobId
// @access Private (employer)
const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate("applicant", "firstName lastName profilePhoto headline skills location resumeUrl experience education")
    .sort({ createdAt: -1 })
    .lean();
  res.json(applications);
});

// @desc  Update application status (employer)
// @route PUT /api/applications/:id/status
// @access Private (employer)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: "Application not found" });
  if (application.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  application.status = status;
  application.statusHistory.push({ status, note: note || "" });
  if (note) application.employerNote = note;
  await application.save();
  res.json(application);
});

module.exports = { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus };
