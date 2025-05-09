const TempReminder = require("../models/tempReminderModel");
const ShoppingList = require("../models/shoppingList");

// ✅ Get reminders for non-expiring items
const getNonExpiringReminders = async (req, res) => {
  try {
    const { showReminders } = req.query;
    if (showReminders !== "true") {
      return res.json([]);
    }

    const today = new Date();

    const reminders = await TempReminder.find({
      $expr: {
        $gte: [
          { $subtract: [today, "$lastPurchasedDate"] },
          { $multiply: ["$reminderInterval", 24 * 60 * 60 * 1000] },
        ],
      },
    });

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

  if (!["add", "skip"].includes(action)) {
    return res.status(400).json({ message: "Invalid action. Use 'add' or 'skip'." });
  }

  try {
    const item = await TempReminder.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    if (action === "add") {
      let shoppingList = await ShoppingList.findOne();
      if (!shoppingList) {
        shoppingList = new ShoppingList({ items: [] });
      }

      if (!shoppingList.items.includes(item.itemName)) {
        shoppingList.items.push(item.itemName);
        await shoppingList.save();
      }

      const daysUsed = Math.floor((new Date() - item.lastPurchasedDate) / (24 * 60 * 60 * 1000));
      item.reminderInterval = daysUsed || 30; // Fallback to 30 days
      item.lastPurchasedDate = new Date();

      await item.save();

      return res.json({ message: "Item added to shopping list and reminder interval updated" });
    }

    if (action === "skip") {
      const timeSkipped = (new Date() - item.lastPurchasedDate) / (24 * 60 * 60 * 1000);
      if (timeSkipped > item.reminderInterval) {
        item.reminderInterval = timeSkipped;
      }

      await item.save();
      return res.json({ message: "Reminder skipped and interval updated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Add a new non-expiring item manually
const addNonExpiringItem = async (req, res) => {
  try {
    const { itemName, reminderInterval, lastPurchasedDate } = req.body;

    const newItem = new TempReminder({
      itemName,
      reminderInterval: reminderInterval || 30,
      lastPurchasedDate: lastPurchasedDate ? new Date(lastPurchasedDate) : new Date(),
    });

    await newItem.save();
    res.json({ message: "Non-expiring item added successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Automatically add due reminders (after interval passed)
const autoAddDueReminders = async (req, res) => {
  try {
    const today = new Date();

    const dueItems = await TempReminder.find({
      $expr: {
        $gte: [
          { $subtract: [today, "$lastPurchasedDate"] },
          { $multiply: ["$reminderInterval", 24 * 60 * 60 * 1000] },
        ],
      },
    });

    let shoppingList = await ShoppingList.findOne();
    if (!shoppingList) {
      shoppingList = new ShoppingList({ items: [] });
    }

    const addedItems = [];

    for (const item of dueItems) {
      if (!shoppingList.items.includes(item.itemName)) {
        shoppingList.items.push(item.itemName);
        addedItems.push({
          itemName: item.itemName,
          hoverMessage: `Time to replenish ${item.itemName}!`,
        });

        item.lastPurchasedDate = new Date();
        await item.save();
      }
    }

    await shoppingList.save();
    return res.json({ addedItems });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = {
  getNonExpiringReminders,
  updateReminder,
  addNonExpiringItem,
  autoAddDueReminders,
};
