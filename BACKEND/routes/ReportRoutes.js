const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel");
const ProductController = require("../controllers/ProductControllers");

// 📌 Inventory Summary Report
router.get("/inventory-summary", async (req, res) => {
    try {
        const products = await Product.find();

        const totalItems = products.length;
        const totalQuantity = products.reduce((acc, product) => acc + (product.Quantity || 0), 0);
        const totalValue = products.reduce((acc, product) => acc + ((product.Quantity || 0) * (product.Price || 0)), 0);

        res.json({ totalItems, totalQuantity, totalValue });
    } catch (error) {
        res.status(500).json({ error: "Error generating inventory summary report" });
    }
});

// 📌 Expiry Status Report
router.get("/expiry-status", async (req, res) => {
    try {
        const today = new Date();
        const expiringSoonThreshold = new Date();
        expiringSoonThreshold.setDate(today.getDate() + 7); // Expiring in 7 days

        const products = await Product.find({ expiryDate: { $exists: true } });

        const expiredProducts = products.filter(product => new Date(product.expiryDate) < today);
        const expiringSoonProducts = products.filter(product => 
            new Date(product.expiryDate) >= today && new Date(product.expiryDate) <= expiringSoonThreshold
        );

        res.json({ expiredProducts, expiringSoonProducts });
    } catch (error) {
        res.status(500).json({ error: "Error generating expiry status report" });
    }
});

// 📌 Category-Wise Report
router.get("/category-wise", async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        const products = await Product.find();

        const categoryReport = categories.map(category => {
            const itemsInCategory = products.filter(product => product.category === category);
            const totalQuantity = itemsInCategory.reduce((acc, product) => acc + (product.Quantity || 0), 0);
            const totalValue = itemsInCategory.reduce((acc, product) => acc + ((product.Quantity || 0) * (product.Price || 0)), 0);

            return { category, totalQuantity, totalValue, items: itemsInCategory };
        });

        res.json(categoryReport);
    } catch (error) {
        res.status(500).json({ error: "Error generating category-wise report" });
    }
});

module.exports = router;
