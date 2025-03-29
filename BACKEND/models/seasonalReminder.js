const mongoose = require("mongoose");

const SeasonalReminderSchema = new mongoose.Schema({
    season: { type: String, required: true }, // ✅ Season Name
    items: { type: [String], required: true }, // ✅ List of items
    reminderDate: { type: Date, required: true }, // ✅ Reminder Date
    message: { type: String, required: true }, // ✅ Custom message with {item}
    month: { type: Number, required: true }, // ✅ Month (April = 4, Dec = 12)
    active: { type: Boolean, default: true }, // ✅ Active status
});

module.exports = mongoose.model("SeasonalReminder", SeasonalReminderSchema);
