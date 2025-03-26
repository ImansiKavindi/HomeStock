const express = require("express");
const router = express.Router();
const BudgetController = require("../controllers/BudgetControllers");

// Budget routes
router.post("/set", BudgetController.setBudget);
router.get("/", BudgetController.getBudget);
router.get("/status", BudgetController.getBudgetStatus);

module.exports = router; 