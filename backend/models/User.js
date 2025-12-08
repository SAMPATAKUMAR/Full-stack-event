import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  college: String,
  branch: String,
  course: String,
  semester: String,
  profilePicture: String,
  bio: String,

  
});

const User = mongoose.model("User", userSchema);
export default User;
