
import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
  game:    { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood:    { type: String }, // optional: "happy", "frustrated", etc.
  date:    { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
