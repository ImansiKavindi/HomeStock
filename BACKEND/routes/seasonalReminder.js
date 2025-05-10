const express = require("express");
const router = express.Router();
const { getActiveSeasonalReminders, addSeasonalItemsToShoppingList } = require("../controllers/seasonalReminderController");

// Route to get active seasonal reminders
router.get("/active", getActiveSeasonalReminders);

// Endpoint to trigger adding seasonal items to the shopping list
router.post("/add-seasonal-items", addSeasonalItemsToShoppingList);

module.exports = router;
