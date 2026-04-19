// routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus,
} = require("../controllers/applicationController");

router.post("/", protect, requireRole("job_seeker"), applyToJob);
router.get("/my", protect, requireRole("job_seeker"), getMyApplications);
router.get("/job/:jobId", protect, requireRole("employer"), getJobApplicants);
router.put("/:id/status", protect, requireRole("employer"), updateApplicationStatus);

module.exports = router;
