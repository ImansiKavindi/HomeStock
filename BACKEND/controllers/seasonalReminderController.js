const SeasonalReminder = require("../models/seasonalReminder");
const ShoppingList = require("../models/shoppingList");

// ✅ Get active seasonal reminders
const getActiveSeasonalReminders = async (req, res) => {
    try {
        const today = new Date();
        const reminders = await SeasonalReminder.find({
            reminderDate: { $lte: today },
        });

        if (reminders.length === 0) {
            return res.status(200).json([]);
        }

        // 🎯 Format reminders for display
        const formattedReminders = reminders.flatMap(reminder =>
            reminder.items.map(item => ({
                _id: reminder._id,
                season: reminder.season,
                reminderDate: reminder.reminderDate,
                message: reminder.message.replace("{item}", item),
                item: item
            }))
        );

        res.status(200).json(formattedReminders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reminders", error: error.message });
    }
};

// ✅ Handle "Add" or "Skip" action
const handleReminderAction = async (req, res) => {
    try {
        const { reminderId, item, action } = req.body;

        if (!reminderId || !item || !action) {
            return res.status(400).json({ message: "reminderId, item, and action are required" });
        }

        if (action === "add") {
            // 🎯 Add item to the shopping list
            let shoppingList = await ShoppingList.findOne({ status: "pending" });

            if (!shoppingList) {
                shoppingList = new ShoppingList({ items: [item], status: "pending" });
            } else if (!shoppingList.items.includes(item)) {
                shoppingList.items.push(item);
            }

            await shoppingList.save();
        }

        // ✅ Store handled reminders in local storage
        res.status(200).json({ message: action === "add" ? `${item} added to shopping list!` : `${item} skipped!`, handledItem: item });
    } catch (error) {
        res.status(500).json({ message: "Error processing reminder action", error: error.message });
    }
};

module.exports = { getActiveSeasonalReminders, handleReminderAction };
