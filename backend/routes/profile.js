// backend/routes/profile.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /api/profile/:uid
 * Fetch user profile by UID
 */
router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("profile GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/profile/:uid
 * Update profile fields (excluding usn & email)
 * Body: { name, bio, college, branch, course, semester, profilePicture? }
 */
router.put("/:uid", async (req, res) => {
  try {
    const { name, bio, college, branch, course, semester, profilePicture } =
      req.body;

    const update = {
      name,
      bio,
      college,
      branch,
      course,
      semester,
    };
    if (profilePicture !== undefined) update.profilePicture = profilePicture;

    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      update,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    console.error("profile PUT error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
