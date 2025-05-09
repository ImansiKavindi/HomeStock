const SeasonalReminder = require("../models/seasonalReminder");
const ShoppingList = require("../models/shoppingList");

// Get active seasonal reminders dynamically based on today's date
const getActiveSeasonalReminders = async (req, res) => {
    try {
        const today = new Date();
        const month = today.getMonth() + 1; // Get current month (April = 4)
        const day = today.getDate(); // Get current day (April 3)

        // Fetch all seasonal reminders and filter active ones dynamically
        const activeReminders = await SeasonalReminder.find({
            month: month,
            $expr: {
                $and: [
                    { $gte: [day, 1] },  // Ensure the day falls within the active range
                    { $lte: [day, 31] }  // Upper limit (change based on season logic)
                ]
            }
        });

        res.json(activeReminders);
    } catch (error) {
        console.error("Error fetching active seasonal reminders:", error);
        res.status(500).send("Error fetching active seasonal reminders.");
    }
};

// Automatically add seasonal items to the shopping list
const addSeasonalItemsToShoppingList = async (req, res) => {
    try {
        const { items } = req.body; // Get the seasonal items from the request
        let shoppingList = await ShoppingList.findOne({ status: "pending" });

        if (!shoppingList) {
            shoppingList = new ShoppingList({ items: [], status: "pending" });
        }

        // Ensure seasonal items are added only if they are not already present
        items.forEach((item) => {
            if (!shoppingList.items.some(listItem => listItem.toLowerCase() === item.toLowerCase())) {
                shoppingList.items.push(item);
            }
        });

        await shoppingList.save();
        res.status(200).send("Items added successfully.");
    } catch (error) {
        console.error("Error adding items to shopping list:", error);
        res.status(500).send("Error adding items.");
    }
};

module.exports = { getActiveSeasonalReminders, addSeasonalItemsToShoppingList };
