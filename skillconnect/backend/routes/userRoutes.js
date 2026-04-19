// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { uploadProfilePhoto, uploadResume } = require("../config/cloudinary");
const {
  getMyProfile, updateProfile, setRole,
  uploadPhoto, uploadResumePDF, getUserById,
  searchUsers, toggleSavedJob, removePhoto,
  getNotifications, markNotificationsRead
} = require("../controllers/userController");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateProfile);
router.put("/role", protect, setRole);
router.put("/photo", protect, uploadProfilePhoto.single("photo"), uploadPhoto);
router.delete("/photo", protect, removePhoto);
router.put("/resume", protect, uploadResume.single("resume"), uploadResumePDF);
router.get("/search", protect, searchUsers);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/read", protect, markNotificationsRead);
router.put("/saved-jobs/:jobId", protect, toggleSavedJob);
router.get("/:id", protect, getUserById);

module.exports = router;
