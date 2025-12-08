// /c:/Projects/ChatGPT/EDUCONNECT/backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import admin from "firebase-admin";
import fs from "fs";

import messagesRoute from "./routes/messages.js";
import Message from "./models/Message.js";
import User from "./models/User.js"; // ensure this exists

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import notesRoutes from "./routes/notes.js";
import adminNotesRoutes from "./routes/adminNotes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/admin", adminNotesRoutes);
app.use("/api/messages", messagesRoute);

// Health
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Firebase Admin init
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-admin-service-account.json";
if (!fs.existsSync(serviceAccountPath)) {
  console.error("Firebase service account JSON not found at", serviceAccountPath);
  process.exit(1);
}
try {
  const sa = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
} catch (err) {
  console.error("Failed to init firebase admin:", err.message);
  process.exit(1);
}

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Socket auth middleware (expects idToken in handshake auth)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("NO_TOKEN"));
    const decoded = await admin.auth().verifyIdToken(token);
    // store minimal user info on socket
    socket.user = { uid: decoded.uid, name: decoded.name || decoded.email || null };
    return next();
  } catch (err) {
    return next(new Error("INVALID_TOKEN"));
  }
});

io.on("connection", (socket) => {
  console.log("user connected", socket.user?.uid);

  // join a room and emit last messages
  socket.on("joinRoom", async (room) => {
    try {
      const r = room || "global";
      socket.join(r);
      socket.currentRoom = r;
      socket.emit("joinedRoom", r);
      console.log(socket.user?.uid, "joined", r);

      const msgs = await Message.find({ room: r }).sort({ createdAt: 1 }).limit(200).lean();
      socket.emit("roomMessages", msgs);
    } catch (err) {
      console.error("joinRoom error", err);
    }
  });

  socket.on("leaveRoom", (room) => {
    try {
      const r = room || socket.currentRoom;
      if (r) {
        socket.leave(r);
        console.log(socket.user?.uid, "left", r);
      }
    } catch (err) {
      console.error("leaveRoom error", err);
    }
  });

  // typing indicators
  socket.on("typing", ({ room, displayName } = {}) => {
    if (!room) return;
    socket.to(room).emit("typing", { uid: socket.user?.uid, displayName });
  });

  socket.on("stopTyping", ({ room, displayName } = {}) => {
    if (!room) return;
    socket.to(room).emit("stopTyping", { uid: socket.user?.uid, displayName });
  });

  // sendMessage with clientId support and robust name resolution
  socket.on("sendMessage", async (data) => {
    try {
      const text = String(data?.text || "").trim();
      const room = String(data?.room || socket.currentRoom || "global");
      const clientId = data?.clientId || null;
      const clientDisplayName = (data?.displayName && String(data.displayName).trim()) || null;

      if (!text) return;

      // 1) Prefer canonical name from MongoDB
      let senderName = null;
      try {
        const userDoc = await User.findOne({ uid: socket.user?.uid }).lean();
        if (userDoc && (userDoc.name || userDoc.displayName)) {
          senderName = userDoc.name || userDoc.displayName;
        }
      } catch (err) {
        console.warn("User lookup failed:", err?.message);
      }

      // 2) If missing, ask Firebase for displayName
      if (!senderName) {
        try {
          const fbUser = await admin.auth().getUser(socket.user?.uid);
          if (fbUser && fbUser.displayName) senderName = fbUser.displayName;
        } catch (err) {
          // ignore
        }
      }

      // 3) fallback to client-provided safe displayName
      if (!senderName && clientDisplayName) senderName = clientDisplayName;

      // 4) final fallback
      if (!senderName) senderName = "Unknown";

      // Save message
      const messageDoc = await Message.create({
        uid: socket.user?.uid,
        room,
        text,
        senderName,
        createdAt: new Date(),
      });

      // Prepare outgoing object and include clientId so clients can reconcile
      const outgoing = {
        ...(typeof messageDoc.toObject === "function" ? messageDoc.toObject() : messageDoc),
        clientId,
      };

      io.to(room).emit("newMessage", outgoing);
    } catch (err) {
      console.error("sendMessage err:", err);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("user disconnected", socket.user?.uid, reason);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
