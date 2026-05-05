const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, default: 0 },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  mode: { type: String, enum: ['walk', 'bike', 'commute', 'ev'], default: 'ev' },
  co2_saved: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
