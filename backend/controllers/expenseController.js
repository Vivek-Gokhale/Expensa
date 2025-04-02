const { GoogleGenerativeAI } = require("@google/generative-ai");
const expenseModel = require('../models/expenseModel');
const userpreferences = require('../models/preferences');
const logger = require('../utils/logger');
const config = require('../utils/config');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(config.geminiApi);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });



async function extractBillDetails(imageBuffer) {
  try {
    const imageBase64 = imageBuffer.toString("base64");

    const prompt = `Extract the following details from the bill image:
      - Bill Title (e.g., Electricity Bill, Grocery Bill, Water Bill, Gas Bill, etc.)
      - Bill Category (e.g., Electricity, Water, Gas, Internet, etc.)
      - Bill Amount (with only numeric value not any formatting also check wheather any extra zeros are put in if yes then remove it)
      - Bill Date (in YYYY-MM-DD format)

      Return the response in **pure JSON format** with no extra text or code blocks:
      {
        "bill_title": "Electricity Bill",
        "bill_category": "Electricity",
        "bill_amount": "₹1200",
        "bill_date": "2025-03-15"
      }`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    if (!result || !result.response) {
      throw new Error("AI Model did not return a response");
    }

    let responseText = result.response.text?.();

    responseText = responseText.replace(/```json|```/g, "").trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error during bill extraction:", error);
    throw new Error("Failed to extract bill details");
  }
}


const getExpenseDetails = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const extractedData = await extractBillDetails(req.file.buffer);

    res.status(200).json({ message: 'Expense details extracted', data: extractedData });
  } catch (error) {
    logger.error('Error extracting expense details', error);
    next(error);
  }
};

const makeExpenseEntry = async (req, res, next) => {
  try {
    const { category, amount, date, user_id, description, file } = req.body;

    let categoryId = await expenseModel.getCategory(user_id,category);
    if (categoryId === -1) {
      categoryId = await expenseModel.addCategory(user_id, category);
    }
    console.log(categoryId);
    // Remove file upload logic from here
    const newExpense = await expenseModel.createExpense({
      user_id, 
      categoryId, 
      amount, 
      date, 
      description, 
      file, // Will be set from Multer middleware
    });

    if (!newExpense) {
      return res.status(400).json({ message: 'Expense creation failed' });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const totalMonthExpense = await expenseModel.getTotalMonthExpense(user_id, currentYear, currentMonth);
    const budgetLimit = await userpreferences.getBudgetLimit(user_id);

    if (budgetLimit !== null) {
      let notificationMessage = '';

      if (totalMonthExpense > budgetLimit) {
        notificationMessage = 'You failed to maintain your monthly budget. You won’t be able to get X coins this month.';
      } else if (totalMonthExpense > budgetLimit * 0.90) {
        notificationMessage = 'You have exceeded 90% of your budget for this month.';
      } else if (totalMonthExpense > budgetLimit * 0.50) {
        notificationMessage = 'You have used more than 50% of your budget for this month.';
      } else if (totalMonthExpense > budgetLimit * 0.25) {
        notificationMessage = 'You have crossed 25% of your budget for this month.';
      }

      if (notificationMessage) {
        await notificationModel.createNotification(user_id, notificationMessage);
      }
    }

    res.status(201).json({ message: 'Expense created successfully', expense: newExpense });
  } catch (error) {
    logger.error('Error creating expense', error);
    next(error);
  }
};




// Edit expense entry
const editExpenseEntry = async (req, res, next) => {
  try {
    const { id, category, amount, date, description, user_id } = req.body;

    let categoryId = await expenseModel.getCategory(user_id,category);
    console.log(categoryId);
    if(categoryId == -1)
    {
        categoryId = await expenseModel.addCategory(user_id, category);
    }


    const updatedExpense = await expenseModel.updateExpense(id, {
      categoryId, 
      amount, 
      date, 
      description, 
    });

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found or update failed' });
    }

    res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
  } catch (error) {
    logger.error('Error updating expense', error);
    next(error);
  }
};

const getExpenseById = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({ message: 'Expense ID is required' });
    }

    const expense = await expenseModel.getExpenseById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense fetched successfully', data: expense });
  } catch (error) {
    logger.error('Error fetching expense by ID', error);
    next(error);
  }
};

// Fetch all expenses for a specific user ID
const getAllExpensesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const expenses = await expenseModel.getTotalExpensesByCategory(userId);

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found for this user' });
    }

    res.status(200).json({ message: 'Expenses fetched successfully', data: expenses });
  } catch (error) {
    logger.error('Error fetching expenses by user ID', error);
    next(error);
  }
};

const deleteExpenseById = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({ message: 'Expense ID is required' });
    }

    const isDeleted = await expenseModel.removeExpenseById(expenseId);

    if (!isDeleted) {
      return res.status(404).json({ message: 'Failed to remove expense' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error('Error deleting expense by ID', error);
    next(error);
  }
};

const getExpenseYears = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const expenseYears = await expenseModel.getYears(userId);

    if (!expenseYears || expenseYears.length === 0) {
      return res.status(404).json({ message: 'No expense years found' });
    }

    res.status(200).json({ message: 'Expense years retrieved successfully', data: expenseYears });
  } catch (error) {
    logger.error('Error fetching expense years', error);
    next(error);
  }
};

const getExpenseByYear = async (req, res, next) => {
  try {
    const { userId, year } = req.params;

    if (!userId || !year) {
      return res.status(400).json({ message: 'User ID and Year are required' });
    }

    const expenses = await expenseModel.getYearExpense(userId, year);

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found for this year' });
    }

    res.status(200).json({ message: 'Expenses retrieved successfully', data: expenses });
  } catch (error) {
    logger.error('Error fetching expenses by year', error);
    next(error);
  }
};

const getExpenseByMonth = async (req, res, next) => {
  try {
    const { userId, year, month } = req.params;

    if (!userId || !year || !month) {
      return res.status(400).json({ message: 'User ID, Year, and Month are required' });
    }

    const expenses = await expenseModel.getMonthExpense(userId, year, month);

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found for this month' });
    }

    res.status(200).json({ message: 'Expenses retrieved successfully', data: expenses });
  } catch (error) {
    logger.error('Error fetching expenses by month', error);
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const categories = await expenseModel.getUserCategories(userId);

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }

    res.status(200).json({ message: 'Categories retrieved successfully', data: categories });
  } catch (error) {
    logger.error('Error fetching categories', error);
    next(error);
  }
};

const getExpenseByCategory = async (req, res, next) => {
  try {
    const { userId, year, month, cid } = req.params;

    if (!userId || !year || !month || !cid) {
      return res.status(400).json({ message: 'User ID, Year, Month, and Category ID are required' });
    }

    const expenses = await expenseModel.getCategoryExpense(userId, year, month, cid);

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found for this category in the given month' });
    }

    res.status(200).json({ message: 'Expenses retrieved successfully', data: expenses });
  } catch (error) {
    logger.error('Error fetching expenses by category', error);
    next(error);
  }
};

module.exports = { getExpenseDetails, makeExpenseEntry, editExpenseEntry, getAllExpensesByUserId,getExpenseById, deleteExpenseById, getExpenseYears, getExpenseByMonth, getExpenseByYear, getCategories, getExpenseByCategory};
