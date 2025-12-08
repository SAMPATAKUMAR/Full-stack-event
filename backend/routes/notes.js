// routes/notes.js (public)
import express from "express";
import Note from "../models/note.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Public upload -> pending
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { branch, scheme, subject, subjectCode, title, url, tags, uploader } = req.body;

    let uploaderObj = {};
    try { uploaderObj = uploader ? JSON.parse(uploader) : {}; } catch (e) { uploaderObj = {}; }

    const note = new Note({
      branch,
      scheme,
      subject,
      subjectCode,
      title,
      url: url || "",
      // <-- store only filename to avoid /uploads/uploads/... problems
      filePath: req.file ? req.file.filename : "",
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      status: "pending", // public uploads must be pending
      uploader: uploaderObj,
    });

    await note.save();
    res.status(201).json({ message: "Uploaded and pending approval", note });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Public: get only approved notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Failed to fetch public notes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
