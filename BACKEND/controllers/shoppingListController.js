const ShoppingList = require("../models/shoppingList");
const SeasonalReminder = require("../models/seasonalReminder");
const Reminder = require("../models/tempReminderModel");
const PDFDocument = require("pdfkit");

// ✅ Add item to shopping list (Allows duplicates for seasonal items)
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
            // Prevent duplicates only if the item is NOT seasonal
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
            return res.json({ items: [] });
        }

        res.json({ items: shoppingList.items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Remove item(s) from the shopping list
exports.removeItems = async (req, res) => {
    try {
        const { itemsToRemove } = req.body;

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

// ✅ Update an item in the shopping list
exports.updateItem = async (req, res) => {
    try {
        const { oldItem, newItem } = req.body;

        let shoppingList = await ShoppingList.findOne({ status: "pending" });

        if (!shoppingList) {
            return res.status(404).json({ message: "No shopping list found." });
        }

        const itemIndex = shoppingList.items.indexOf(oldItem);
        if (itemIndex === -1) {
            return res.status(400).json({ message: "Item not found in the shopping list." });
        }

        shoppingList.items[itemIndex] = newItem;
        await shoppingList.save();

        res.json({ message: "Item updated successfully!", shoppingList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Clear the entire shopping list (Fixed)
exports.clearShoppingList = async (req, res) => {
    try {
        let shoppingList = await ShoppingList.findOne({ status: "pending" });

        if (!shoppingList) {
            return res.status(404).json({ message: "No shopping list found." });
        }

        shoppingList.items = []; // ✅ Empty the list instead of deleting the document
        await shoppingList.save();

        res.json({ message: "Shopping list cleared successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Download Shopping List as PDF
exports.downloadShoppingList = async (req, res) => {
    try {
        let shoppingList = await ShoppingList.findOne({ status: "pending" });

        if (!shoppingList || shoppingList.items.length === 0) {
            return res.status(404).json({ message: "No items to download." });
        }

        const doc = new PDFDocument();
        res.setHeader("Content-Disposition", 'attachment; filename="ShoppingList.pdf"');
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);
        doc.fontSize(20).text("Shopping List", { align: "center" }).moveDown();
        shoppingList.items.forEach((item, index) => {
            doc.fontSize(14).text(`${index + 1}. ${item}`);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
