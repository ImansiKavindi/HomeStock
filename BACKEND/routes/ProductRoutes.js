const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductControllers");


// Routes for Low Stock and Out of Stock products
router.get("/lowstock", ProductController.getLowStockProducts);  // Fetch low stock products
router.get("/outofstock", ProductController.getOutOfStockProducts);  // Fetch out of stock products

// CRUD routes
router.post("/create", ProductController.createProduct); // Create
router.get("/", ProductController.getAllProducts); // Read all products
router.get("/:id", ProductController.getProductById); // Read one product
router.put("/:id", ProductController.updateProduct); // Update
router.delete("/:id", ProductController.deleteProduct); // Delete
router.get("/generate-report", ProductController.generateReport);



module.exports = router;
