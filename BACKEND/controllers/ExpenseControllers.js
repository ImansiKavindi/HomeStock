const ExpenseModel = require("../models/ExpenseModel");

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { itemName, category, subcategory, amount } = req.body;

    const expense = new ExpenseModel({
      itemName,
      category,
      subcategory,
      amount
    });

    await expense.save();
    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await ExpenseModel.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    res.status(200).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update expense by ID
exports.updateExpense = async (req, res) => {
  try {
    const { itemName, category, subcategory, amount } = req.body;
    
    let expense = await ExpenseModel.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    // Update fields only if they are provided
    if (itemName !== undefined) expense.itemName = itemName;
    if (category !== undefined) expense.category = category;
    if (subcategory !== undefined) expense.subcategory = subcategory;
    if (amount !== undefined) expense.amount = amount;

    await expense.save();
    res.status(200).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete expense by ID
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await ExpenseModel.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    await expense.deleteOne();
    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get expenses by category
exports.getExpensesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const expenses = await ExpenseModel.find({ category }).sort({ createdAt: -1 });
    
    if (!expenses.length) {
      return res.status(404).json({ success: false, message: "No expenses found in this category" });
    }

    res.status(200).json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 