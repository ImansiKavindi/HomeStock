const express = require("express");
const router = express.Router();
const BudgetController = require("../controllers/BudgetControllers");

// Budget routes
router.post("/set", BudgetController.setBudget);
router.get("/", BudgetController.getBudget);
router.get("/status", BudgetController.getBudgetStatus);
router.get("/report", BudgetController.generateBudgetReport);

module.exports = router; 