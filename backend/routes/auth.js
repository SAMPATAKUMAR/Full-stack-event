import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { uid, name, usn, email, password, college, branch, course, semester } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { usn }] });
    if (existingUser) {
      if (existingUser.email === email) return res.status(400).json({ message: "Email already registered" });
      if (existingUser.usn === usn) return res.status(400).json({ message: "USN already registered" });
    }

    const newUser = new User({ uid, name, usn, email, password, college, branch, course, semester });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (check both email and USN)
router.post("/login", async (req, res) => {
  try {
    const { email, usn } = req.body;
    const user = await User.findOne({ email, usn });
    if (!user) return res.status(404).json({ message: "No user found with this email and USN" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by UID
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET /api/admin/notes
router.get("/notes", async (req,res) => {
  const notes = await Note.find();
  res.json(notes);
});

// POST /api/admin/notes
router.post("/notes", async (req,res) => {
  const note = new Note(req.body);
  await note.save();
  res.json(note);
});

// DELETE /api/admin/notes/:id
router.delete("/notes/:id", async (req,res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});


export default router;
