const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/get', expenseController.getExpenseDetails);
router.post('/add', expenseController.makeExpenseEntry);
router.put('/edit', expenseController.editExpenseEntry);
router.get('/get-single-expense/:id', expenseController.getExpenseById);
router.get('/get-all-expense/:id', expenseController.getAllExpensesByUserId);

module.exports = router;
