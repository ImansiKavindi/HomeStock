const ProductModel = require("../models/ProductModel");
const multer = require("multer");
const path = require("path");

// Multer Storage Setup (Local)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where the images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
  }
});

const upload = multer({ storage }).single("P_Image");

// ✅ Create a new product
exports.createProduct = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: "Image upload failed", error: err });
    }

    try {
      const { P_name, Category, Price, Quantity, Expire_Date } = req.body;
      const P_Image = req.file ? req.file.path : null; // Store local image path

      const product = new ProductModel({
        P_name,
        P_Image,
        Category,
        Price,
        Quantity,
        Expire_Date,
      });

      await product.save();
      res.status(201).json({ success: true, product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update product by ID
exports.updateProduct = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: "Image upload failed", error: err });
    }

    try {
      const { P_name, Category, Price, Quantity, Expire_Date } = req.body;
      let product = await ProductModel.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // Delete old image if a new one is uploaded
      if (req.file && product.P_Image) {
        // Assuming you want to delete the file from local storage
        const fs = require('fs');
        fs.unlinkSync(product.P_Image);
      }

      // Update fields
      product.P_name = P_name || product.P_name;
      product.P_Image = req.file ? req.file.path : product.P_Image;
      product.Category = Category || product.Category;
      product.Price = Price || product.Price;
      product.Quantity = Quantity || product.Quantity;
      product.Expire_Date = Expire_Date || product.Expire_Date;

      await product.save();
      res.status(200).json({ success: true, product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ✅ Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete image from local storage
    if (product.P_Image) {
      const fs = require('fs');
      fs.unlinkSync(product.P_Image); // Deleting the image from the 'uploads' folder
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get low stock products (Quantity between 1 and 15)
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await ProductModel.find({
      Quantity: { $gt: 0, $lt: 16 }
    });

    if (!lowStockProducts.length) {
      return res.status(404).json({ success: false, message: "No low stock products found" });
    }

    res.status(200).json({ success: true, lowStockProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get out of stock products (Quantity = 0)
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const outOfStockProducts = await ProductModel.find({ Quantity: 0 });

    if (!outOfStockProducts.length) {
      return res.status(404).json({ success: false, message: "No out of stock products found" });
    }

    res.status(200).json({ success: true, outOfStockProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
