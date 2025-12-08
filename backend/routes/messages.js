import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// GET last N messages for a room (query: ?room=roomName&limit=50)
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50'), 200);
    const room = req.query.room || 'global';
    const messages = await Message.find({ room }).sort({ createdAt: -1 }).limit(limit);
    res.json(messages.reverse()); // oldest -> newest
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
