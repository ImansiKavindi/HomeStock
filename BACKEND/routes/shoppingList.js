const express = require("express");
const router = express.Router();
const ShoppingList = require("../models/shoppingList");


// ✅ Add item to shopping list
router.post("/add", async (req, res) => {
    try {
        const { itemName, season, userId } = req.body;
        const newItem = new ShoppingList({ itemName, season, userId });

        await newItem.save();
        res.status(201).json({ message: "Item added to shopping list!", newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get all shopping list items
router.get("/", async (req, res) => {
    try {
        const shoppingList = await ShoppingList.find();
        res.status(200).json(shoppingList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Remove item from shopping list
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await ShoppingList.findByIdAndDelete(id);
        res.status(200).json({ message: "Item removed from shopping list!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Skip item (so it doesn’t appear again)
router.post("/skip", async (req, res) => {
    try {
        const { itemName, season, userId } = req.body;
        console.log(`User ${userId} skipped ${itemName} for ${season}`);
        res.status(200).json({ message: `${itemName} skipped successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
