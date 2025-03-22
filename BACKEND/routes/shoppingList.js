const express = require("express");
const router = express.Router();
const shoppingListController = require("../controllers/shoppingListController");

// ✅ Add item to shopping list
router.post("/add", shoppingListController.addItem);

// ✅ Get shopping list
router.get("/", shoppingListController.getShoppingList);

// ✅ Remove item(s) from shopping list
router.post("/remove", shoppingListController.removeItems);

// ✅ Update an item
router.post("/update", shoppingListController.updateItem);

// ✅ Clear the entire shopping list
router.delete("/clear", shoppingListController.clearShoppingList);

// ✅ Download Shopping List as PDF
router.get("/download", shoppingListController.downloadShoppingList);

module.exports = router;
