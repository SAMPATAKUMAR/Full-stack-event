// backend/routes/adminNotes.js
import express from "express";
import Note from "../models/note.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

// Multer storage (same as public)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/**
 * GET /api/admin/notes
 * All notes (any status)
 */
router.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Failed to fetch all notes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/admin/notes/pending
 */
router.get("/notes/pending", async (req, res) => {
  try {
    const pending = await Note.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    res.json(pending);
  } catch (err) {
    console.error("Failed to fetch pending notes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/admin/notes/approved
 */
router.get("/notes/approved", async (req, res) => {
  try {
    const approved = await Note.find({ status: "approved" }).sort({
      createdAt: -1,
    });
    res.json(approved);
  } catch (err) {
    console.error("Failed to fetch approved notes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * POST /api/admin/notes
 * Admin upload (auto-approved)
 */
router.post("/notes", upload.single("file"), async (req, res) => {
  try {
    const { branch, scheme, subject, subjectCode, title, url, tags, adminName } =
      req.body;

    const note = new Note({
      branch,
      scheme,
      subject,
      subjectCode,
      title,
      url: url || "",
      filePath: req.file ? req.file.filename : "",
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      status: "approved",
      approvedBy: adminName || "admin",
      approvedAt: new Date(),
    });

    await note.save();

    // optional: notify uploader if present
    const uploaderEmail = note.uploader?.email;
    if (uploaderEmail) {
      try {
        await sendMail({
          to: uploaderEmail,
          subject: `Your note "${note.title}" is published`,
          html: `<p>Hi ${note.uploader?.name || ""},</p><p>Your note "<strong>${note.title}</strong>" is now published by admin.</p><p>— EduConnect Team</p>`,
          text: `Your note "${note.title}" is now published by admin.`,
        });
      } catch (e) {
        console.warn("Admin upload mail failed:", e.message);
      }
    }

    res.status(201).json({ message: "Note created and auto-approved", note });
  } catch (err) {
    console.error("Admin upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/admin/notes/:id/approve
 */
router.patch("/notes/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName, message } = req.body;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.status = "approved";
    note.approvedBy = adminName || "admin";
    note.approvedAt = new Date();
    if (message) note.approvalMessage = message;
    await note.save();

    const uploaderEmail = note.uploader?.email;
    if (uploaderEmail) {
      try {
        await sendMail({
          to: uploaderEmail,
          subject: `Your note "${note.title}" has been approved`,
          html: `<p>Hi ${
            note.uploader?.name || ""
          },</p><p>Your note "<strong>${
            note.title
          }</strong>" has been approved and is now visible to everyone.</p>${
            message
              ? `<p><strong>Message from admin:</strong> ${message}</p>`
              : ""
          }<p>Thanks — EduConnect Team</p>`,
          text: `Your note "${note.title}" has been approved. ${
            message ? "Message: " + message : ""
          }`,
        });
      } catch (e) {
        console.error("Email send error (approve):", e.message);
      }
    }

    res.json({ message: "Note approved", note });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/admin/notes/:id/reject
 */
router.patch("/notes/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName, message, deleteFile } = req.body;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.status = "rejected";
    note.approvedBy = adminName || "admin";
    note.approvedAt = new Date();
    if (message) note.approvalMessage = message;
    await note.save();

    if (
      deleteFile &&
      note.filePath &&
      fs.existsSync(path.join("uploads", note.filePath))
    ) {
      try {
        fs.unlinkSync(path.join("uploads", note.filePath));
      } catch (e) {
        console.warn("Failed to delete file:", e.message);
      }
    }

    const uploaderEmail = note.uploader?.email;
    if (uploaderEmail) {
      try {
        await sendMail({
          to: uploaderEmail,
          subject: `Your note "${note.title}" was not approved`,
          html: `<p>Hi ${
            note.uploader?.name || ""
          },</p><p>Your note "<strong>${
            note.title
          }</strong>" was not approved.</p>${
            message ? `<p><strong>Reason:</strong> ${message}</p>` : ""
          }<p>If you'd like to re-submit after edits, please upload again.</p><p>— EduConnect Team</p>`,
          text: `Your note "${note.title}" was not approved. ${
            message ? "Reason: " + message : ""
          }`,
        });
      } catch (e) {
        console.error("Email send error (reject):", e.message);
      }
    }

    res.json({ message: "Note rejected", note });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * DELETE /api/admin/notes/:id
 */
router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (
      note.filePath &&
      fs.existsSync(path.join("uploads", note.filePath))
    ) {
      fs.unlinkSync(path.join("uploads", note.filePath));
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
