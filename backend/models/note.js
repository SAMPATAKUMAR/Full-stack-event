// models/note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  scheme: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String },
  filePath: { type: String },
  tags: [String],
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  uploader: {
    uid: { type: String },
    name: { type: String },
    email: { type: String },
  },
  approvalMessage: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Note", noteSchema);
