const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  P_name: {
    type: String,
    required: true,
  },
 
  Category: {
    type: String,
    required: [true, "Please enter product category"],
    enum: {
      values: [
        'Pantry Staples',
        'Refrigerated Items',
        'Fruits & Vegetables',
        'Cleaning Supplies',
        'Personal Care & Hygiene',
        'Health & First Aid',
        'Home Maintenance & Tools',
        'Other'
      ],
      message: "Please select a correct category"
    }
  },
 
  
  Quantity: {
    value: { type: Number, required: true },
    unit: { type: String, required: true } // kg, L, pieces, etc.
  },

  Price: {
    type: Number,
    required: true,
  },
   
  
  Expire_Date: {
    type: Date,
    required: true,
  },
 
}, { timestamps: true });

module.exports = mongoose.model("ProductModel", productSchema);
