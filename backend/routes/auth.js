// backend/routes/auth.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { uid, name, usn, email, password, college, branch, course, semester }
 */
router.post("/register", async (req, res) => {
  try {
    const {
      uid,
      name,
      usn,
      email,
      password,
      college,
      branch,
      course,
      semester,
    } = req.body;

    if (!uid || !email || !usn || !password) {
      return res
        .status(400)
        .json({ message: "uid, email, usn and password are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { usn }] });
    if (existingUser) {
      if (existingUser.email === email)
        return res.status(400).json({ message: "Email already registered" });
      if (existingUser.usn === usn)
        return res.status(400).json({ message: "USN already registered" });
    }

    const newUser = new User({
      uid,
      name,
      usn,
      email,
      password,
      college,
      branch,
      course,
      semester,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("auth/register error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, usn }
 * (You actually use Firebase for password, this is just Mongo lookup)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, usn } = req.body;
    const user = await User.findOne({ email, usn });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email and USN" });
    }
    res.json({ user });
  } catch (err) {
    console.error("auth/login error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/:uid
 * Get user by Firebase UID
 */
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("auth/:uid error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
