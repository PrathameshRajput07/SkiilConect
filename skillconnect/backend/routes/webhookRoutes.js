// routes/webhookRoutes.js — Clerk webhook to sync users to MongoDB
const express = require("express");
const router = express.Router();
const { Webhook } = require("svix");
const User = require("../models/User");

// Clerk sends raw body, so we need this before json() middleware
router.post("/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return res.status(500).json({ message: "Webhook secret not configured" });
  }

  // Verify webhook signature using svix
  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ message: "Missing svix headers" });
  }

  let event;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(req.body, { "svix-id": svixId, "svix-timestamp": svixTimestamp, "svix-signature": svixSignature });
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const { type, data } = event;
  console.log(`Clerk webhook: ${type}`);

  try {
    if (type === "user.created") {
      // Create user in MongoDB
      const existing = await User.findOne({ clerkId: data.id });
      if (!existing) {
        await User.create({
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address || "",
          firstName: data.first_name || "User",
          lastName: data.last_name || "",
          profilePhoto: data.image_url || "",
        });
        console.log(`✅ User created in MongoDB: ${data.id}`);
      }
    } else if (type === "user.updated") {
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: data.email_addresses[0]?.email_address || "",
          firstName: data.first_name || "User",
          lastName: data.last_name || "",
          profilePhoto: data.image_url || "",
        }
      );
      console.log(`✅ User updated in MongoDB: ${data.id}`);
    } else if (type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: data.id });
      console.log(`✅ User deleted from MongoDB: ${data.id}`);
    }
  } catch (err) {
    console.error("Error handling webhook:", err.message);
    return res.status(500).json({ message: "Error processing webhook" });
  }

  res.json({ received: true });
});

module.exports = router;
