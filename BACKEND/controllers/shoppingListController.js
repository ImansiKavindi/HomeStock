const ShoppingList = require("../models/shoppingList");
const SeasonalReminder = require("../models/seasonalReminder");
const Reminder = require("../models/tempReminderModel");
const PDFDocument = require("pdfkit");

// ✅ Add item to shopping list
exports.addItem = async (req, res) => {
    try {
        const { item, isSeasonal } = req.body;

        if (!item) {
            return res.status(400).json({ error: "Item name is required." });
        }

        let shoppingList = await ShoppingList.findOne({ status: "pending" });

        if (!shoppingList) {
            shoppingList = new ShoppingList({ items: [item], status: "pending" });
        } else {
            // ✅ Seasonal items can be added multiple times
            if (!isSeasonal && shoppingList.items.includes(item)) {
                return res.status(400).json({ message: "This item is already in the shopping list." });
            }
            shoppingList.items.push(item);
        }

        await shoppingList.save();
        res.status(201).json({ message: "Item added to shopping list!", shoppingList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get the current shopping list
exports.getShoppingList = async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findOne({ status: "pending" });

        if (!shoppingList) {
            return res.status(404).json({ message: "No shopping list found" });
        }

        res.json(shoppingList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Remove item(s) from the shopping list (Fixed undefined error)
exports.removeItems = async (req, res) => {
    try {
        const { itemsToRemove } = req.body;

        // ✅ Validate request body
        if (!itemsToRemove || !Array.isArray(itemsToRemove)) {
            return res.status(400).json({ error: "Invalid request. 'itemsToRemove' must be an array." });
        }

        let shoppingList = await ShoppingList.findOne({ status: "pending" });
        if (!shoppingList) {
            return res.status(404).json({ message: "No shopping list found." });
        }

        shoppingList.items = shoppingList.items.filter(item => !itemsToRemove.includes(item));
        await shoppingList.save();

        res.json({ message: "Successfully removed items", shoppingList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Clear the entire shopping list
exports.clearShoppingList = async (req, res) => {
    try {
        await ShoppingList.deleteOne({ status: "pending" });
        res.json({ message: "Shopping list cleared successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Download Shopping List as PDF (Includes seasonal and non-expiring items)
exports.downloadPDF = async (req, res) => {
    try {
        const shoppingList = await ShoppingList.findOne({ status: "pending" });
        const shoppingItems = shoppingList ? shoppingList.items : [];

        const nonExpiringItems = await Reminder.find({ status: "pending" });
        const nonExpiringItemsList = nonExpiringItems.map(item => item.name);

        const seasonalReminders = await SeasonalReminder.find({ status: "pending" });
        const seasonalItemsList = seasonalReminders.map(item => item.itemName);

        // ✅ Seasonal items are NOT filtered for duplicates
        const allItems = [...shoppingItems, ...nonExpiringItemsList, ...seasonalItemsList];

        if (allItems.length === 0) {
            return res.status(404).json({ message: "No items in the shopping list." });
        }

        const doc = new PDFDocument();
        const filename = "ShoppingList.pdf";
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // PDF Title
        doc.fontSize(16).text("🛒 My Shopping List", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`📅 Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        allItems.forEach((item, index) => {
            doc.text(`${index + 1}. ${item}`);
        });

        doc.moveDown();
        doc.text("--------------------------");
        doc.text("Thank you for using HomeStock!", { align: "center" });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
