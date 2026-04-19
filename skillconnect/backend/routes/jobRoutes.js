// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs } = require("../controllers/jobController");

router.get("/", getJobs);                                           // Public: browse all
router.post("/", protect, requireRole("employer"), createJob);      // Employer: create
router.get("/my-jobs", protect, requireRole("employer"), getMyJobs); // Employer: my posted jobs
router.get("/:id", getJobById);                                     // Public: job detail
router.put("/:id", protect, requireRole("employer"), updateJob);    // Employer: update
router.delete("/:id", protect, requireRole("employer"), deleteJob); // Employer: delete

module.exports = router;
