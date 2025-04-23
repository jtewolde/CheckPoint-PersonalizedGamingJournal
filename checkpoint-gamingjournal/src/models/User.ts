// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Needed for credentials auth
  image: { type: String },
  emailVerified: { type: Date, default: null },
  games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
