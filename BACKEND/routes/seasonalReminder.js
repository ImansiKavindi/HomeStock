 
 const express = require("express");
 const router = express.Router();
 const { getActiveSeasonalReminders } = require("../controllers/seasonalReminderController");
 
 // GET active seasonal reminders
 router.get("/", getActiveSeasonalReminders);
 
 module.exports = router;