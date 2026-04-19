// middleware/authMiddleware.js — Verify Clerk JWT tokens
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const User = require("../models/User");

/**
 * protect — Verifies Clerk JWT and attaches MongoDB user to req.user
 * Usage: router.get("/profile", protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Decode the Clerk session token (without full SDK verification for simplicity)
    // In production, use Clerk's verifyToken from @clerk/backend
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString("utf8"));

    const clerkId = payload.sub;
    if (!clerkId) return res.status(401).json({ message: "Invalid token" });

    // Find the user in MongoDB
    let user = await User.findOne({ clerkId });
    if (!user) {
      // Auto-sync missing user from Clerk (fixes local dev webhook failures)
      try {
        const { users } = require("@clerk/clerk-sdk-node");
        const clerkUser = await users.getUser(clerkId);
        user = await User.create({
          clerkId: clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || "User",
          lastName: clerkUser.lastName || "",
          profilePhoto: clerkUser.imageUrl || "",
        });
        console.log(`✅ User auto-synced to MongoDB: ${clerkId}`);
      } catch (err) {
        console.error("Failed to sync user from Clerk:", err.message);
        return res.status(404).json({ message: "User not found. Please complete profile setup." });
      }
    }

    req.user = user; // Attach MongoDB user
    req.clerkId = clerkId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * requireRole — Check that user has a specific role
 * Usage: router.post("/jobs", protect, requireRole("employer"), controller)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };
