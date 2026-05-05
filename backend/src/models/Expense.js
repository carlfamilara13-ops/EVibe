const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: false },
  userId: { type: String, default: '' },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['charging', 'food', 'accommodation', 'other'], required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
