const express = require('express');
const multer = require('multer');
const path = require('path');
const expenseController = require('../controllers/expenseController');
const saveProfileImages = require('../utils/saveProfileImages');

const router = express.Router();

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'D:/expensa/backend/billsImage');
  },
  filename: (req, file, cb) => {
    const uniqueFileName = saveProfileImages(file.originalname);
    req.body.file = uniqueFileName; // Store filename in request body
    cb(null, uniqueFileName);
  }
});

const memoryStorage = multer.memoryStorage();

const uploadToDisk = multer({ storage: diskStorage });
const uploadToMemory = multer({ storage: memoryStorage });

// Routes
router.get('/get', uploadToMemory.single('file'), expenseController.getExpenseDetails);
router.post('/add', uploadToDisk.single('file'), expenseController.makeExpenseEntry); // Now handles file uploads
router.put('/edit', expenseController.editExpenseEntry);
router.get('/get-single-expense/:expenseId', expenseController.getExpenseById);
router.get('/get-all-expense/:userId', expenseController.getAllExpensesByUserId);
router.post('/delete-expense/:expenseId', expenseController.deleteExpenseById);
router.get('/get-expense-years/:userId', expenseController.getExpenseYears);
router.get('/get-expense-byyear/:userId/:year', expenseController.getExpenseByYear);
router.get('/get-expense-bymonth/:userId/:year/:month', expenseController.getExpenseByMonth);
router.get('/get-categories/:userId', expenseController.getCategories);
router.get('/get-expense-bycategory/:userId/:year/:month/:cid', expenseController.getExpenseByCategory);

module.exports = router;
