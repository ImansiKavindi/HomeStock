
const ProductModel = require("../models/ProductModel");
const multer = require("multer");
const path = require("path");
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Multer Storage Setup (Local)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where the images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
  }
})

const upload = multer({ storage }).single("P_Image");

// ✅ Create a new product
exports.createProduct = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: "Image upload failed", error: err });
    }

    try {
      const { P_name, Category, QuantityValue, QuantityUnit, Price,Expire_Date } = req.body;
      const P_Image = req.file ? req.file.filename : null;

      const product = new ProductModel({
        P_name,
        Category,
        Quantity: { value: QuantityValue, unit: QuantityUnit },
        Price,
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

    const updatedProducts = products.map(product => ({
      ...product._doc,
      P_Image: product.P_Image ? `http://localhost:8090/uploads/${product.P_Image}` : null
    }));

    res.status(200).json({ success: true, products: updatedProducts });
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

    product.P_Image = product.P_Image ? `http://localhost:8090/uploads/${product.P_Image}` : null;

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
      const { P_name, Category, Price, QuantityValue, QuantityUnit, Expire_Date } = req.body;
      let product = await ProductModel.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // ✅ Update product fields if provided
      if (P_name !== undefined) product.P_name = P_name;
      if (Category !== undefined) product.Category = Category;
      if (Price !== undefined) product.Price = Number(Price);
      if (Expire_Date !== undefined) {
        const parsedDate = new Date(Expire_Date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid date format" });
        }
        product.Expire_Date = parsedDate;
      }

      // ✅ Correctly updating `Quantity`
      if (QuantityValue !== undefined || QuantityUnit !== undefined) {
        product.Quantity = {
          value: QuantityValue !== undefined ? Number(QuantityValue) : product.Quantity.value,
          unit: QuantityUnit !== undefined ? QuantityUnit : product.Quantity.unit,
        };
      }

      // ✅ Handling image update
      if (req.file) {
        product.P_Image = req.file.filename; // Save new image filename
      }

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
      "Quantity.value": { $gt: 0, $lt: 16 }
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
    const outOfStockProducts = await ProductModel.find({ "Quantity.value": 0 });

    if (!outOfStockProducts.length) {
      return res.status(404).json({ success: false, message: "No out of stock products found" });
    }

    res.status(200).json({ success: true, outOfStockProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Generate and Download Inventory Report
exports.generateReport = async (req, res) => {
  try {
    const { date } = req.query; // Get date from request

    if (!date) {
      return res.status(400).json({ success: false, message: "Please provide a date in YYYY-MM-DD format." });
    }

    // Convert date to correct format
    const selectedDate = new Date(date);
    selectedDate.setHours(23, 59, 59, 999); // Ensure it captures the full day

    // Fetching data
    const expiredProducts = await ProductModel.find({ Expire_Date: { $lte: selectedDate } });
    const lowStockProducts = await ProductModel.find({ "Quantity.value": { $gt: 0, $lt: 16 } });
    const outOfStockProducts = await ProductModel.find({ "Quantity.value": 0 });

    // Create PDF document
    const doc = new PDFDocument();
    const reportFilePath = path.join(__dirname, "../reports/inventory_report.pdf");
    doc.pipe(fs.createWriteStream(reportFilePath));

    // Title
    doc.fontSize(16).text(`Inventory Report for ${date}`, { align: 'center' });
    doc.moveDown();

    // Expired Products
    doc.fontSize(12).text("Expired Products:", { underline: true });
    expiredProducts.forEach(product => {
      doc.text(`Name: ${product.P_name} | Expiry Date: ${product.Expire_Date}`);
    });
    doc.moveDown();

    // Low Stock Products
    doc.fontSize(12).text("Low Stock Products (Quantity between 1 and 15):", { underline: true });
    lowStockProducts.forEach(product => {
      doc.text(`Name: ${product.P_name} | Quantity: ${product.Quantity.value}`);
    });
    doc.moveDown();

    // Out of Stock Products
    doc.fontSize(12).text("Out of Stock Products (Quantity = 0):", { underline: true });
    outOfStockProducts.forEach(product => {
      doc.text(`Name: ${product.P_name}`);
    });
    doc.moveDown();

    // Save the PDF and send it to the user
    doc.end();

    // After creating the PDF, send it to the client
    res.download(reportFilePath, 'Inventory_Report.pdf', (err) => {
      if (err) {
        res.status(500).json({ success: false, message: "Failed to download report" });
      } else {
        // Optionally, you can delete the file after sending it
        fs.unlinkSync(reportFilePath);  // Delete the file after download
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
