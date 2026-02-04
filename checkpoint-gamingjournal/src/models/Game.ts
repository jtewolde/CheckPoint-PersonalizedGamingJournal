// Model/Schema for Game
import { boolean } from 'better-auth';
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  igdbId:       { type: Number, required: true }, // IGDB game ID
  name:         { type: String, required: true },
  coverImageId: { type: String },
  summary:      { type: String },
  status:      { type: String, enum: ['playing', 'completed', 'on_hold', 'dropped', 'plan_to_play'], default: 'plan_to_play' },
  isPlatinum:   { type: Boolean },
  rating:       { type: Number },
  platforms:    [String],
  genres:       [String],
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Game || mongoose.model('Game', GameSchema);
