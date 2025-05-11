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

// Generate PDF report for budget
exports.generateBudgetReport = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    // Get budget and expenses data
    const budget = await BudgetModel.findOne({ active: true });
    
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: "No active budget found" 
      });
    }

    // Get all expenses
    const expenses = await ExpenseModel.find().sort({ createdAt: -1 });
    
    // Calculate budget statistics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budget.amount - totalExpenses;
    const percentUsed = (totalExpenses / budget.amount) * 100;
    const isExceeded = remaining < 0;

    // Calculate expenses by category
    const categorySummary = {};
    expenses.forEach(expense => {
      if (!categorySummary[expense.category]) {
        categorySummary[expense.category] = 0;
      }
      categorySummary[expense.category] += expense.amount;
    });

    // Create a PDF document
    const doc = new PDFDocument();
    const filename = `budget-report-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    // Pipe the PDF to a file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add content to the PDF
    // Header
    doc.fontSize(25).text('HomeStock Budget Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Budget Summary
    doc.fontSize(18).text('Budget Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Total Budget: LKR ${budget.amount.toFixed(2)}`);
    doc.text(`Total Expenses: LKR ${totalExpenses.toFixed(2)}`);
    doc.text(`Remaining Budget: LKR ${Math.abs(remaining).toFixed(2)} ${isExceeded ? '(Exceeded)' : ''}`);
    doc.text(`Budget Utilization: ${percentUsed.toFixed(2)}%`);
    doc.moveDown(2);

    // Expense Category Breakdown
    doc.fontSize(18).text('Expense Categories', { underline: true });
    doc.moveDown();
    
    Object.keys(categorySummary).forEach(category => {
      const amount = categorySummary[category];
      const percentage = ((amount / totalExpenses) * 100).toFixed(2);
      doc.text(`${category}: LKR ${amount.toFixed(2)} (${percentage}%)`);
    });
    doc.moveDown(2);

    // Expense List
    doc.fontSize(18).text('Recent Expenses', { underline: true });
    doc.moveDown();
    
    // Define table layout
    const tableTop = doc.y;
    const itemX = 50;
    const categoryX = 200;
    const amountX = 350;
    const dateX = 450;

    // Table header
    doc.fontSize(12).text('Item', itemX, tableTop);
    doc.text('Category', categoryX, tableTop);
    doc.text('Amount (LKR)', amountX, tableTop);
    doc.text('Date', dateX, tableTop);
    
    doc.moveTo(50, tableTop + 20)
       .lineTo(550, tableTop + 20)
       .stroke();
    
    // Table rows
    let tableRow = tableTop + 30;
    
    // Only show the 15 most recent expenses in the report
    const recentExpenses = expenses.slice(0, 15);
    
    recentExpenses.forEach(expense => {
      const date = new Date(expense.createdAt).toLocaleDateString();
      
      doc.text(expense.itemName, itemX, tableRow);
      doc.text(expense.category, categoryX, tableRow);
      doc.text(expense.amount.toFixed(2), amountX, tableRow);
      doc.text(date, dateX, tableRow);
      
      tableRow += 20;
      
      // Add new page if we run out of space
      if (tableRow > 700) {
        doc.addPage();
        tableRow = 50;
      }
    });

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be fully written
    stream.on('finish', () => {
      // Send the PDF file as a download
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          return res.status(500).json({ success: false, message: "Error sending report" });
        }
        
        // Delete the file after sending
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 