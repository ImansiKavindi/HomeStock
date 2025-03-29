const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "Please enter budget amount"],
    min: [0, "Budget amount cannot be negative"]
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("BudgetModel", budgetSchema); 