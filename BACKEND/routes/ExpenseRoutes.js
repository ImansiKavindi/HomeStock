const express = require("express");
const router = express.Router();
const ExpenseController = require("../controllers/ExpenseControllers");

// CRUD routes
router.post("/create", ExpenseController.createExpense); // Create
router.get("/", ExpenseController.getAllExpenses); // Read all expenses
router.get("/:id", ExpenseController.getExpenseById); // Read one expense
router.put("/:id", ExpenseController.updateExpense); // Update
router.delete("/:id", ExpenseController.deleteExpense); // Delete

// Category specific route
router.get("/category/:category", ExpenseController.getExpensesByCategory);

module.exports = router; 