
import mongoose from 'mongoose';

const playSessionSchema = new mongoose.Schema({
    duration:   { type: String, required: true },
    notes: { type: String, required: true },
    game:    { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date:    { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', playSessionSchema);
