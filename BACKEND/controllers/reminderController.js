const TempReminder = require("../models/tempReminderModel");
const ShoppingList = require("../models/shoppingList");

// ✅ Get reminders for non-expiring items
const getNonExpiringReminders = async (req, res) => {
  try {
    const today = new Date();

    const reminders = await TempReminder.find({
      $expr: {
        $gte: [
          { $subtract: [today, "$lastPurchasedDate"] },
          { $multiply: ["$reminderInterval", 24 * 60 * 60 * 1000] }, // Convert days to milliseconds
        ],
      },
    });

    // Generate user-friendly messages
    const reminderMessages = reminders.map((item) => {
      const daysUsed = Math.floor((today - item.lastPurchasedDate) / (24 * 60 * 60 * 1000));
      return {
        _id: item._id,
        itemName: item.itemName,
        reminderMessage: `You have been using ${item.itemName} for ${daysUsed} days. Do you want to get a new one?`,
      };
    });

    res.json(reminderMessages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Update reminder when user clicks "Add" or "Skip"
const updateReminder = async (req, res) => {
  const { itemId, action } = req.body;

  try {
    const item = await TempReminder.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    if (action === "add") {
      // ✅ Find existing Shopping List (if any)
      let shoppingList = await ShoppingList.findOne();

      if (shoppingList) {
        // ✅ Add item to existing list if not already present
        if (!shoppingList.items.includes(item.itemName)) {
          shoppingList.items.push(item.itemName);
          await shoppingList.save();
        }
      } else {
        // ✅ Create a new shopping list if none exists
        shoppingList = new ShoppingList({
          items: [item.itemName], // Start with this item
        });
        await shoppingList.save();
      }

      // ✅ Delete the reminder after adding to shopping list
      await TempReminder.findByIdAndDelete(itemId);
      return res.json({ message: "Item added to shopping list and reminder deleted" });
    }

    if (action === "skip") {
      const timeSkipped = (new Date() - item.lastPurchasedDate) / (24 * 60 * 60 * 1000);

      if (timeSkipped > item.reminderInterval) {
        item.reminderInterval = timeSkipped; // ✅ Smart learning interval update
      }

      await item.save();
      await TempReminder.findByIdAndDelete(itemId); // ✅ Delete reminder after skipping
      return res.json({ message: "Reminder skipped and deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Add a new non-expiring item
const addNonExpiringItem = async (req, res) => {
  try {
    const { itemName, reminderInterval, lastPurchasedDate } = req.body;

    const newItem = new TempReminder({
      itemName,
      reminderInterval: reminderInterval || 30, // Default: 30 days
      lastPurchasedDate: lastPurchasedDate ? new Date(lastPurchasedDate) : new Date(),
    });

    await newItem.save();
    res.json({ message: "Non-expiring item added successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { getNonExpiringReminders, updateReminder, addNonExpiringItem };
