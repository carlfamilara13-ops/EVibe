const express = require('express');
const router = express.Router();
const { addIncome, getIncomes, deleteIncome, getDailySummary, getMonthlySummary, getYearlySummary } = require('../controllers/incomeController');

router.post('/', addIncome);
router.get('/', getIncomes);
router.delete('/:id', deleteIncome);
router.get('/summary/daily', getDailySummary);
router.get('/summary/monthly', getMonthlySummary);
router.get('/summary/yearly', getYearlySummary);

module.exports = router;
