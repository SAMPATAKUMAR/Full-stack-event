import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ✅ Fetch user profile by UID
router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update profile (excluding usn & email)
router.put("/:uid", async (req, res) => {
  try {
    const { name, bio, college, branch, course, semester } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { name, bio, college, branch, course, semester },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;