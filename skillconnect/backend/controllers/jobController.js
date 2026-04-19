// controllers/jobController.js — Job CRUD and search
const asyncHandler = require("express-async-handler");
const Job = require("../models/Job");

// @desc  Create a job posting
// @route POST /api/jobs
// @access Private (employer only)
const createJob = asyncHandler(async (req, res) => {
  const {
    title, description, requirements, responsibilities,
    company, companyLogo, companyWebsite, industry,
    location, workType, jobType,
    salaryMin, salaryMax, salaryCurrency, salaryPeriod, showSalary,
    skills, experienceLevel, experienceYears, deadline,
  } = req.body;

  if (!title || !description || !location || !company) {
    return res.status(400).json({ message: "Title, description, location, and company are required" });
  }

  const job = await Job.create({
    employer: req.user._id,
    title, description, requirements, responsibilities,
    company: company || req.user.companyName,
    companyLogo: companyLogo || req.user.companyLogo,
    companyWebsite, industry,
    location, workType, jobType,
    salaryMin, salaryMax, salaryCurrency, salaryPeriod, showSalary,
    skills: skills || [],
    experienceLevel, experienceYears, deadline,
  });

  res.status(201).json(job);
});

// @desc  Get all jobs with filtering
// @route GET /api/jobs
// @access Public
const getJobs = asyncHandler(async (req, res) => {
  const {
    search, location, workType, jobType, experienceLevel,
    salaryMin, salaryMax, skills, page = 1, limit = 10,
  } = req.query;

  const query = { status: "active" };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (location) query.location = new RegExp(location, "i");
  if (workType) query.workType = workType;
  if (jobType) query.jobType = jobType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (salaryMin) query.salaryMax = { $gte: Number(salaryMin) };
  if (salaryMax) query.salaryMin = { $lte: Number(salaryMax) };
  if (skills) {
    const skillsArr = skills.split(",").map((s) => s.trim());
    query.skills = { $in: skillsArr };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate("employer", "firstName lastName profilePhoto companyName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc  Get single job
// @route GET /api/jobs/:id
// @access Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("employer", "firstName lastName profilePhoto companyName companyWebsite industry")
    .lean();
  if (!job) return res.status(404).json({ message: "Job not found" });

  // Increment view count
  await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json(job);
});

// @desc  Update job
// @route PUT /api/jobs/:id
// @access Private (employer who posted)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to edit this job" });
  }

  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(updated);
});

// @desc  Delete job
// @route DELETE /api/jobs/:id
// @access Private (employer who posted)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  await job.deleteOne();
  res.json({ message: "Job deleted" });
});

// @desc  Get employer's posted jobs
// @route GET /api/jobs/my-jobs
// @access Private (employer)
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(jobs);
});

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs };
