const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['salary', 'allowance', 'gift', 'other'], default: 'other' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Income', IncomeSchema);
