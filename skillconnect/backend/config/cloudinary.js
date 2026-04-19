// config/cloudinary.js — Cloudinary setup for file uploads
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for post images
const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillconnect/posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

// Storage for profile photos
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillconnect/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

// Storage for resumes (PDFs)
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillconnect/resumes",
    allowed_formats: ["pdf"],
    resource_type: "raw",
  },
});

const uploadPostImage = multer({ storage: postImageStorage });
const uploadProfilePhoto = multer({ storage: profilePhotoStorage });
const uploadResume = multer({ storage: resumeStorage });

module.exports = { cloudinary, uploadPostImage, uploadProfilePhoto, uploadResume };
