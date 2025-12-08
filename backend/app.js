// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import admin from "firebase-admin";
import authRoutes from "./routes/auth.js";
import serviceAccount from "./firebase-service.json" assert { type: "json" };

// 🔐 Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 📦 Connect MongoDB
mongoose
  .connect("mongodb+srv://educonnet:Roopa7002@educonnect.ztgtdpt.mongodb.net/?retryWrites=true&w=majority&appName=EduConnect", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 🔗 Routes
app.use("/api/auth", authRoutes);

// 🚀 Start server
app.listen(5000, () => console.log("✅ Server running on port 5000"));
