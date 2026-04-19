// controllers/userController.js — User profile CRUD
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @desc  Get current user profile
// @route GET /api/users/me
// @access Private
const getMyProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc  Update user profile
// @route PUT /api/users/me
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, headline, about, location, skills,
    experience, education, projects,
    companyName, companyWebsite, companyDescription, industry, companySize,
    linkedinUrl, githubUrl, portfolioUrl,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Update fields if provided
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (headline !== undefined) user.headline = headline;
  if (about !== undefined) user.about = about;
  if (location !== undefined) user.location = location;
  if (skills) user.skills = skills;
  if (experience) user.experience = experience;
  if (education) user.education = education;
  if (projects) user.projects = projects;
  if (companyName !== undefined) user.companyName = companyName;
  if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
  if (companyDescription !== undefined) user.companyDescription = companyDescription;
  if (industry !== undefined) user.industry = industry;
  if (companySize !== undefined) user.companySize = companySize;
  if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) user.githubUrl = githubUrl;
  if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;

  // Check profile completeness
  user.isProfileComplete = !!(user.headline && user.about && user.location);

  const updated = await user.save();
  res.json(updated);
});

// @desc  Set user role (job_seeker or employer)
// @route PUT /api/users/role
// @access Private
const setRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["job_seeker", "employer"].includes(role)) {
    return res.status(400).json({ message: "Invalid role. Must be job_seeker or employer" });
  }
  const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true });
  res.json({ message: "Role updated", user });
});

// @desc  Upload profile photo
// @route PUT /api/users/photo
// @access Private
const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePhoto: req.file.path }, // Cloudinary URL stored in req.file.path
    { new: true }
  );
  res.json({ profilePhoto: user.profilePhoto });
});

// @desc  Remove profile photo
// @route DELETE /api/users/photo
// @access Private
const removePhoto = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePhoto: "" },
    { new: true }
  );
  res.json({ profilePhoto: user.profilePhoto });
});

// @desc  Upload resume PDF
// @route PUT /api/users/resume
// @access Private
const uploadResumePDF = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { resumeUrl: req.file.path },
    { new: true }
  );
  res.json({ resumeUrl: user.resumeUrl });
});

// @desc  Get public user profile by ID
// @route GET /api/users/:id
// @access Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-connections -connectionRequests -savedJobs")
    .lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  // Log profile visit notification if not visiting own profile
  if (req.user && req.user._id.toString() !== user._id.toString()) {
    const { Notification } = require("../models/index");
    
    // Optional: Avoid spamming views continuously by checking if a view exists in the last 1 hr
    const recentView = await Notification.findOne({
      recipient: user._id,
      triggerUser: req.user._id,
      action: "view",
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });
    
    if (!recentView) {
      await Notification.create({
        recipient: user._id,
        triggerUser: req.user._id,
        action: "view"
      });
    }
  }

  res.json(user);
});

// @desc  Search users
// @route GET /api/users/search?q=name
// @access Private
const searchUsers = asyncHandler(async (req, res) => {
  const { q, role } = req.query;
  const query = {};
  if (q) {
    const regex = new RegExp(q, "i");
    query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }, { headline: regex }, { companyName: regex }];
  }
  if (role) query.role = role;

  const users = await User.find(query)
    .select("firstName lastName email profilePhoto headline role companyName location")
    .limit(20)
    .lean();
  res.json(users);
});

// @desc  Save / unsave a job
// @route PUT /api/users/saved-jobs/:jobId
// @access Private
const toggleSavedJob = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const jobId = req.params.jobId;
  const idx = user.savedJobs.indexOf(jobId);
  if (idx > -1) {
    user.savedJobs.splice(idx, 1);
  } else {
    user.savedJobs.push(jobId);
  }
  await user.save();
  res.json({ savedJobs: user.savedJobs });
});

// @desc  Get notifications
// @route GET /api/users/notifications
// @access Private
const getNotifications = asyncHandler(async (req, res) => {
  const { Notification } = require("../models/index");
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("triggerUser", "firstName lastName profilePhoto headline")
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  res.json(notifications);
});

// @desc  Mark notifications as read
// @route PUT /api/users/notifications/read
// @access Private
const markNotificationsRead = asyncHandler(async (req, res) => {
  const { Notification } = require("../models/index");
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );
  res.json({ message: "Marked as read" });
});

module.exports = { 
  getMyProfile, updateProfile, setRole, uploadPhoto, removePhoto, 
  uploadResumePDF, getUserById, searchUsers, toggleSavedJob,
  getNotifications, markNotificationsRead
};
