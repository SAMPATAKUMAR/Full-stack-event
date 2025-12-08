// backend/routes/messages.js
import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

/**
 * GET /api/messages?room=roomName&limit=50
 * Return last N messages for a room (oldest -> newest)
 */
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const room = req.query.room || "global";
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(messages.reverse());
  } catch (err) {
    console.error("messages GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
