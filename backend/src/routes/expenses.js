const express = require('express');
const router = express.Router();
const { addExpense, getTripExpenses, deleteExpense, getUserExpenses } = require('../controllers/expenseController');

router.post('/', addExpense);
router.get('/user', getUserExpenses);
router.get('/trip/:tripId', getTripExpenses);
router.delete('/:id', deleteExpense);

module.exports = router;
