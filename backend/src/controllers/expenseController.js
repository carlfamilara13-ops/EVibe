const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    await Trip.findByIdAndUpdate(req.body.tripId, { $inc: { spent: req.body.amount } });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTripExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    await Trip.findByIdAndUpdate(expense.tripId, { $inc: { spent: -expense.amount } });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
