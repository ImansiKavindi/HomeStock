const express = require("express");
const router = express.Router();
const shoppingListController = require("../controllers/shoppingListController");

// ✅ Routes for shopping list
router.post("/add", shoppingListController.addItem);
router.get("/", shoppingListController.getShoppingList);
router.delete("/remove", shoppingListController.removeItems);
router.delete("/clear", shoppingListController.clearShoppingList);
router.get("/download-pdf", shoppingListController.downloadPDF);

module.exports = router;
