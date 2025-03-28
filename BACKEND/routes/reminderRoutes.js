const express = require("express");
const { getNonExpiringReminders, updateReminder, addNonExpiringItem } = require("../controllers/reminderController");

const router = express.Router();

router.get("/non-expiring", getNonExpiringReminders);
router.post("/update", updateReminder);
router.post("/add", addNonExpiringItem);  // <-- Make sure this route is defined!


module.exports = router; 
