import express from "express";
import Note from "../models/note.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ========== MULTER STORAGE ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ========== GET ALL NOTES ==========
router.get("/notes", async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

// ========== UPLOAD NOTE ==========
router.post("/notes", upload.single("file"), async (req, res) => {
  const { branch, scheme, subject, subjectCode, title, url, tags } = req.body;

  const note = new Note({
    branch,
    scheme,
    subject,
    subjectCode,
    title,
    url: url || "",
    filePath: req.file ? req.file.filename : "",

    tags: tags ? tags.split(",").map(t => t.trim()) : []
  });

  await note.save();
  res.json(note);
});

// ========== DELETE NOTE ==========
router.delete("/notes/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ message: "Note not found" });
  if (note.filePath && fs.existsSync(note.filePath)) {
    fs.unlinkSync(note.filePath);
  }

  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
// PATCH update note metadata
router.patch("/notes/:id", async (req, res) => {
  try {
    const { branch, scheme, subject, subjectCode, title, url, tags } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Update fields only if provided
    if (branch) note.branch = branch;
    if (scheme) note.scheme = scheme;
    if (subject) note.subject = subject;
    if (subjectCode) note.subjectCode = subjectCode;
    if (title) note.title = title;
    if (url !== undefined) note.url = url;
    if (tags !== undefined) note.tags = tags.split(",").map(t => t.trim());

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
