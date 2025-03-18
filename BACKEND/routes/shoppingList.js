const express = require("express");
const router = express.Router();
const ShoppingList = require("../models/shoppingList");

// ✅ Add item to shopping list
router.post("/add", async (req, res) => {
    try {
        const { item, userId } = req.body;

        let shoppingList = await ShoppingList.findOne({ status: "pending" });

        if (!shoppingList) {
            shoppingList = new ShoppingList({ items: [item], status: "pending" });
        } else if (!shoppingList.items.includes(item)) {
            shoppingList.items.push(item);
        }

        await shoppingList.save();
        res.status(201).json({ message: "Item added to shopping list!", shoppingList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
