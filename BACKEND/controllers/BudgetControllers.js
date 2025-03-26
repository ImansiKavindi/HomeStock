const BudgetModel = require("../models/BudgetModel");
const ExpenseModel = require("../models/ExpenseModel");
const NotificationModel = require("../models/NotificationModel");

// Create or update budget
exports.setBudget = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate input
    if (!amount || amount < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid budget amount" 
      });
    }

    // Find active budget
    let budget = await BudgetModel.findOne({ active: true });

    if (budget) {
      // Update existing budget
      budget.amount = amount;
      await budget.save();
    } else {
      // Create new budget
      budget = new BudgetModel({ amount });
      await budget.save();
    }

    // Check if expenses exceed the new budget
    await checkBudgetExceeded(budget);

    res.status(200).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current budget
exports.getBudget = async (req, res) => {
  try {
    const budget = await BudgetModel.findOne({ active: true });
    
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: "No active budget found" 
      });
    }

    res.status(200).json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get budget status with expense comparison
exports.getBudgetStatus = async (req, res) => {
  try {
    const budget = await BudgetModel.findOne({ active: true });
    
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: "No active budget found" 
      });
    }

    // Calculate total expenses
    const expenses = await ExpenseModel.find();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate remaining budget
    const remaining = budget.amount - totalExpenses;
    const isExceeded = remaining < 0;
    
    // Percentage of budget used
    const percentUsed = (totalExpenses / budget.amount) * 100;

    res.status(200).json({
      success: true,
      budgetAmount: budget.amount,
      totalExpenses,
      remaining,
      percentUsed,
      isExceeded
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to check if budget is exceeded and create notification
const checkBudgetExceeded = async (budget) => {
  try {
    // Calculate total expenses
    const expenses = await ExpenseModel.find();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Check if expenses exceed budget
    if (totalExpenses > budget.amount) {
      // Create notification
      const exceededAmount = totalExpenses - budget.amount;
      const notification = new NotificationModel({
        message: `Budget exceeded by ${exceededAmount.toFixed(2)}`,
        type: 'budget_exceeded',
        data: {
          budgetAmount: budget.amount,
          totalExpenses,
          exceededAmount
        }
      });
      
      await notification.save();
    }
  } catch (error) {
    console.error("Error checking budget:", error);
  }
}; 