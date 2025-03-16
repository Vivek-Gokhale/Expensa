const { GoogleGenerativeAI } = require("@google/generative-ai");
const expenseModel = require('../models/expenseModel');
const logger = require('../utils/logger');
const config = require('../utils/config');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(config.geminiApi);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const saveImage = (imageData, originalName) => {
  const sanitizedFilename = originalName.replace(/[^a-zA-Z0-9_.-]/g, '');
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  let uniqueName = `${timestamp}_${sanitizedFilename}`;
  if(config.mode == 'development')
  {
        uniqueName = `${config.backendurl}/expense-image/${uniqueName}`;
  }
  const imagePath = path.join(__dirname, '..', 'billsImage', uniqueName);

  fs.writeFileSync(imagePath, imageData);

  return uniqueName;
};

// Extract bill details from image
async function extractBillDetails(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const prompt = `Extract the following details from the bill image: 
      - Bill Title (e.g., Electricity Bill, Grocery Bill, Water Bill, Gas Bill, Internet Bill, Movie Ticket, Restaurant Bill, Fuel Bill, Gym Membership, Tuition Fee, etc.)
      - Bill Category (e.g., Electricity, Water, Gas, Internet, Telephone, Housing, Food, Shopping, Entertainment, Healthcare, Transportation, Education, Personal Care, Financial Services)
      - Bill Amount (with currency symbol)
      - Bill Date (in YYYY-MM-DD format)
    
      Return the response in JSON format like this:
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

    const responseText = result.response?.text();
    if (!responseText) {
      throw new Error('AI Model did not return valid data');
    }

    return JSON.parse(responseText);
  } catch (error) {
    logger.error('Error during bill extraction:', error);
    throw new Error('Failed to extract bill details');
  }
}

// Get expense details
const getExpenseDetails = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const uniqueFilename = saveImage(req.file.buffer, req.file.originalname);
    const filePath = path.join(__dirname, '..', 'billsImage', uniqueFilename);

    const extractedData = await extractBillDetails(filePath);

    res.status(200).json({ message: 'Expense details extracted', data: extractedData });
  } catch (error) {
    logger.error('Error extracting expense details', error);
    next(error);
  }
};

// Make expense entry
const makeExpenseEntry = async (req, res, next) => {
  try {
    const {category, amount, date, user_id, description } = req.body;
    let billImagePath = '';

    if (req.file) {
      billImagePath = saveImage(req.file.buffer, req.file.originalname);
    }

    const newExpense = await expenseModel.createExpense({
      user_id, 
      category, 
      amount, 
      date, 
      description, 
      bill_image : billImagePath,
    });

    if (!newExpense) {
      return res.status(400).json({ message: 'Expense creation failed' });
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
    const { id, category, amount, date, description } = req.body;
    let billImagePath = '';

    if (req.file) {
      billImagePath = saveImage(req.file.buffer, req.file.originalname);
    }

    const updatedExpense = await expenseModel.updateExpense(id, {
      category, 
      amount, 
      date, 
      description, 
      bill_image : billImagePath,
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

    const expenses = await expenseModel.getAllExpensesByUserId(userId);

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found for this user' });
    }

    res.status(200).json({ message: 'Expenses fetched successfully', data: expenses });
  } catch (error) {
    logger.error('Error fetching expenses by user ID', error);
    next(error);
  }
};


module.exports = { getExpenseDetails, makeExpenseEntry, editExpenseEntry, getAllExpensesByUserId,getExpenseById};
