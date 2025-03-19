const mongoose = require("mongoose");

const tempReminderSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  reminderInterval: {
    type: Number, // Store interval in days
    default: 30, // Default 1 month
  },
  lastPurchasedDate: {
    type: Date,
    default: Date.now, // Fake purchase date
  },
});

module.exports = mongoose.model("TempReminder", tempReminderSchema);
