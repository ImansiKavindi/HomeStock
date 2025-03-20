import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from './Sidebar';
import "../css/ProductList.css"; // Import CSS for styling

const API_URL = "http://localhost:8090/api/products";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpireDate, setSelectedExpireDate] = useState("");

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data.products);
      setFilteredProducts(res.data.products); // Initialize filtered products
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Handle delete product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts(products.filter((product) => product._id !== id));
      setFilteredProducts(filteredProducts.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Handle edit product
  const editProduct = (product) => {
    setEditingProduct(product._id);
    setUpdatedProduct(product);
  };

  // Handle update change
  const handleChange = (e) => {
    setUpdatedProduct({ ...updatedProduct, [e.target.name]: e.target.value });
  };

  // Save updated product
  const saveProduct = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, updatedProduct);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    filterProducts(e.target.value, selectedExpireDate);
  };

  // Handle expiry date filter change
  const handleExpireDateChange = (e) => {
    const selectedDate = e.target.value;
    setSelectedExpireDate(selectedDate);
    filterProducts(selectedCategory, selectedDate);
  };

  // Get the expiry status message
  const getExpiryStatusMessage = (expireDate) => {
    const currentDate = new Date();
    const expiryDate = new Date(expireDate);
    const timeDiff = expiryDate - currentDate;
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert time difference to days

    if (daysLeft < 0) {
      return "Already expired";
    } else if (daysLeft === 0) {
      return "Expired today";
    } else if (daysLeft === 1) {
      return "1 day left";
    } else {
      return `${daysLeft} days left`;
    }
  };

  // Filter products based on category and expiry date
  const filterProducts = (category, expireDate) => {
    let filtered = products;

    // Filter by category
    if (category) {
      filtered = filtered.filter((product) => product.Category === category);
    }

    // Filter by expiry date
    if (expireDate) {
      filtered = filtered.filter((product) => {
        const productExpireDate = new Date(product.Expire_Date);
        const selectedDate = new Date(expireDate);

        // Add expiry status message based on the expiration date
        let expiryMessage = getExpiryStatusMessage(product.Expire_Date);
        product.expiryMessage = expiryMessage; // Add the message to the product

        return productExpireDate >= selectedDate; // Show products that expire today or later
      });
    }

    setFilteredProducts(filtered); // Update filtered products state
  };

  // Handle add product (navigate to add product page)
  const handleAddProduct = () => {
    window.location.href = "/add-product"; // Modify this based on your route for adding a product
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="product-container">
        <Sidebar />
      <h2>Product List</h2>

      {/* Category Filter */}
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">All Categories</option>
        {/* Add other categories dynamically or hardcode */}
        <option value="Pantry Staples">Pantry Staples</option>
          <option value="Refrigerated Items">Refrigerated Items</option>
          <option value="Fruits & Vegetables">Fruits & Vegetables</option>
          <option value="Cleaning Supplies">Cleaning Supplies</option>
          <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
          <option value="Health & First Aid">Health & First Aid</option>
          <option value="Home Maintenance & Tools">Home Maintenance & Tools</option>
          <option value="Other">Other</option>

      </select>

      {/* Expiry Date Filter */}
      <input
        type="date"
        value={selectedExpireDate}
        onChange={handleExpireDateChange}
        placeholder="Filter by Expiry Date"
      />

      {/* Add Product Button */}
      <button onClick={handleAddProduct}>Add Product</button>

      {/* Table of filtered products */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Expire Date</th>
            <th>Actions</th>
            <th>Expiry Status</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product._id}>
              {editingProduct === product._id ? (
                <>
                  <td>
                    <input type="text" name="P_name" value={updatedProduct.P_name} onChange={handleChange} />
                  </td>
                  <td>
                    <input type="text" name="Category" value={updatedProduct.Category} onChange={handleChange} />
                  </td>
                  <td>
                    <input type="number" name="Price" value={updatedProduct.Price} onChange={handleChange} />
                  </td>
                  <td>
                    <input type="number" name="Quantity" value={updatedProduct.Quantity} onChange={handleChange} />
                  </td>
                  <td>
                    <input type="text" name="Expire_Date" value={updatedProduct.Expire_Date} onChange={handleChange} />
                  </td>
                  <td>
                    <button onClick={() => saveProduct(product._id)}>Save</button>
                    <button onClick={() => setEditingProduct(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{product.P_name}</td>
                  <td>{product.Category}</td>
                  <td>Rs {product.Price}</td>
                  <td>{product.Quantity}</td>
                  <td>{product.Expire_Date}</td>
                  
                  <td>
                    <button onClick={() => editProduct(product)}>Edit</button>
                    <button onClick={() => deleteProduct(product._id)}>Delete</button>
                  </td>
                  <td>{product.expiryMessage}</td> {/* Display expiry status */}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
