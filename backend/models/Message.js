import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  displayName: { type: String },
  text: { type: String, required: true },
  room: { type: String, default: 'global' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema);
