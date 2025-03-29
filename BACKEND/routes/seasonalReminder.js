const express = require("express");
const router = express.Router();
const { getActiveSeasonalReminders, handleReminderAction } = require("../controllers/seasonalReminderController");

// ✅ Get active reminders
router.get("/active", getActiveSeasonalReminders);

// ✅ Handle "Add" or "Skip" action
router.post("/action", handleReminderAction);

module.exports = router;
