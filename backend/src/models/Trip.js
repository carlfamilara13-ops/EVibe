const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, default: 0 },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  mode: { type: String, enum: ['walking', 'biking', 'commute', 'ev'], default: 'ev' },
  // Carbon data
  carbonData: {
    tripEmission: { type: Number, default: 0 },
    carEmission: { type: Number, default: 0 },
    savedKg: { type: Number, default: 0 },
    savedPercentage: { type: Number, default: 0 },
    treesEquivalent: { type: Number, default: 0 },
    energyKwh: { type: Number, default: 0 },
  },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
