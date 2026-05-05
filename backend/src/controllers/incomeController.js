const Income = require('../models/Income');
const Expense = require('../models/Expense');

exports.addIncome = async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.status(201).json(income);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const filter = { userId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const incomes = await Income.find(filter).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) return res.status(404).json({ error: 'Income not found' });
    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDailySummary = async (req, res) => {
  try {
    const { userId, date } = req.query;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const incomes = await Income.find({ userId, date: { $gte: start, $lte: end } });
    const expenses = await Expense.find({ userId, createdAt: { $gte: start, $lte: end } });

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    res.json({
      date,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomes,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const incomes = await Income.find({ userId, date: { $gte: start, $lte: end } });
    const expenses = await Expense.find({ userId, createdAt: { $gte: start, $lte: end } });

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    // Previous month
    const prevStart = new Date(year, month - 2, 1);
    const prevEnd = new Date(year, month - 1, 0, 23, 59, 59);
    const prevIncomes = await Income.find({ userId, date: { $gte: prevStart, $lte: prevEnd } });
    const prevExpenses = await Expense.find({ userId, createdAt: { $gte: prevStart, $lte: prevEnd } });
    const prevIncome = prevIncomes.reduce((s, i) => s + i.amount, 0);
    const prevExpense = prevExpenses.reduce((s, e) => s + e.amount, 0);

    // Daily breakdown for calendar
    const dailyMap = {};
    incomes.forEach(i => {
      const d = new Date(i.date).toISOString().split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = { income: 0, expenses: 0 };
      dailyMap[d].income += i.amount;
    });
    expenses.forEach(e => {
      const d = new Date(e.createdAt).toISOString().split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = { income: 0, expenses: 0 };
      dailyMap[d].expenses += e.amount;
    });

    res.json({
      month, year,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      prevIncome,
      prevExpense,
      incomeChange: prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : null,
      expenseChange: prevExpense > 0 ? ((totalExpenses - prevExpense) / prevExpense * 100).toFixed(1) : null,
      dailyMap,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getYearlySummary = async (req, res) => {
  try {
    const { userId, year } = req.query;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const incomes = await Income.find({ userId, date: { $gte: start, $lte: end } });
    const expenses = await Expense.find({ userId, createdAt: { $gte: start, $lte: end } });

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    // Monthly breakdown
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const mIncome = incomes.filter(x => new Date(x.date).getMonth() === i).reduce((s, x) => s + x.amount, 0);
      const mExpense = expenses.filter(x => new Date(x.createdAt).getMonth() === i).reduce((s, x) => s + x.amount, 0);
      return { month: i + 1, income: mIncome, expenses: mExpense, balance: mIncome - mExpense };
    });

    res.json({ year, totalIncome, totalExpenses, balance: totalIncome - totalExpenses, monthly });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
