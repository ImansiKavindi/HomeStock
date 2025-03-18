const mongoose = require("mongoose");

const seasonalReminderSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    season: {
      type: String,
      required: true,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const SeasonalReminder = mongoose.model("SeasonalReminder", seasonalReminderSchema);

// ✅ Fix: Define seasonalReminders properly
const seasonalReminders = [
  {
    season: "Sinhala and Tamil New Year",
    items: ["Oil", "Sugar", "Flour"],
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-04-15"),
  },
  {
    season: "Christmas",
    items: ["Cake Ingredients", "Wine", "Decorations"],
    startDate: new Date("2025-12-01"),
    endDate: new Date("2025-12-25"),
  },
];

module.exports = { SeasonalReminder, seasonalReminders };
