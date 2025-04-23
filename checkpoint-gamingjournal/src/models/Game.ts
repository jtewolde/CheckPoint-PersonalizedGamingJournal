// Model/Schema for Game
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  igdbId:       { type: Number, required: true }, // IGDB game ID
  name:         { type: String, required: true },
  coverImageId: { type: String },
  summary:      { type: String },
  platforms:    [String],
  genres:       [String],
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Game || mongoose.model('Game', GameSchema);
