const mongoose = require("mongoose");

const shoppingListSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
        },
        season: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ShoppingList", shoppingListSchema);
