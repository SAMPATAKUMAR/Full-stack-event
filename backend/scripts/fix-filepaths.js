// scripts/fix-filepaths.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Note from "../models/note.js"; // adjust path if necessary

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const notes = await Note.find({ filePath: /uploads/ });
for (const n of notes) {
  const name = n.filePath.split(/[/\\]/).pop();
  n.filePath = name;
  await n.save();
  console.log("Fixed", n._id, "->", n.filePath);
}

await mongoose.disconnect();
console.log("Done");
