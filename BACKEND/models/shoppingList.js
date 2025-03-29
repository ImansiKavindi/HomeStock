const mongoose = require("mongoose");

const shoppingListSchema = new mongoose.Schema({
    items: [{ type: String, required: true }], // ✅ Ensure "items" is an array
     
});

module.exports = mongoose.model("ShoppingList", shoppingListSchema);
