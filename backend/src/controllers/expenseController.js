const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    if (req.body.tripId) {
      await Trip.findByIdAndUpdate(req.body.tripId, { $inc: { spent: req.body.amount } });
    }
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

exports.getUserExpenses = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const filter = { userId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.createdAt = { $gte: start, $lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (expense.tripId) {
      await Trip.findByIdAndUpdate(expense.tripId, { $inc: { spent: -expense.amount } });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
