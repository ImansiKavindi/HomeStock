const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, "Please enter expense item name"],
    trim: true
  },
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: {
      values: [
        'Groceries',
        'Utilities',
        'Housing',
        'Transportation',
        'Entertainment',
        'Healthcare',
        'Education',
        'Personal Care',
        'Dining Out',
        'Travel',
        'Clothing',
        'Home Improvement',
        'Electronics',
        'Gifts',
        'Other'
      ],
      message: "Please select a valid category"
    }
  },
  subcategory: {
    type: String,
    required: [true, "Please select a subcategory"],
  },
  amount: {
    type: Number,
    required: [true, "Please enter expense amount"],
    min: [0, "Amount cannot be negative"]
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("ExpenseModel", expenseSchema); 