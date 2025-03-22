import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from './Sidebar';
import "../css/ProductList.css"; // Import CSS for styling
import { FaEdit, FaTrash, FaSave, FaTimes, FaDownload, FaPlus} from "react-icons/fa";
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";


const API_URL = "http://localhost:8090/api/products";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpireDate, setSelectedExpireDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReportDate, setIsReportDate] = useState(false);  // Flag to differentiate

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data.products);
      setFilteredProducts(res.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const deleteProduct = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will not be able to recover this product!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          setProducts(products.filter((product) => product._id !== id));
          setFilteredProducts(filteredProducts.filter((product) => product._id !== id));
          Swal.fire('Deleted!', 'The product has been deleted.', 'success');
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire('Error!', 'There was an error deleting the product.', 'error');
        }
      }
    });
  };

  const editProduct = (product) => {
    setEditingProduct(product._id);
    setUpdatedProduct(product);
  };

  const handleChange = (e) => {
    setUpdatedProduct({ ...updatedProduct, [e.target.name]: e.target.value });
  };

  const saveProduct = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, updatedProduct);
      setEditingProduct(null);
      fetchProducts();
      Swal.fire('Success!', 'Product has been updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating product:", error);
      Swal.fire('Error!', 'There was an error updating the product.', 'error');
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    filterProducts(e.target.value, selectedExpireDate, searchQuery);
  };

  const handleExpireDateChange = (e) => {
    const selectedDate = e.target.value;
    setSelectedExpireDate(selectedDate);
    filterProducts(selectedCategory, selectedDate, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts(selectedCategory, selectedExpireDate, query);
  };

  const getExpiryStatusMessage = (expireDate) => {
    const currentDate = new Date();
    const expiryDate = new Date(expireDate);
    const timeDiff = expiryDate - currentDate;
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

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

  const filterProducts = (category, expireDate, searchQuery) => {
    let filtered = products;

    if (category) {
      filtered = filtered.filter((product) => product.Category === category);
    }

    if (expireDate) {
      filtered = filtered.filter((product) => {
        const productExpireDate = new Date(product.Expire_Date);
        const selectedDate = new Date(expireDate);
        return productExpireDate >= selectedDate; // Only show products that have not expired
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.P_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    window.location.href = "/add-product";
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options); // Converts to "Month Day, Year"
  };

  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Product List Report", 14, 20);
  
    // Set the font size for the table headers
    doc.setFontSize(12);
  
    // Table headers
    doc.text("Name", 14, 30);
    doc.text("Category", 50, 30);
    doc.text("Price", 100, 30);
    doc.text("Quantity", 130, 30);
    doc.text("Expire Date", 160, 30);
    doc.text("Expiry Status", 200, 30);
  
    let yPosition = 40;
  
    // Loop through filtered products and add them to the PDF
    filteredProducts.forEach((product) => {
      doc.text(product.P_name, 14, yPosition);
      doc.text(product.Category, 50, yPosition);
      doc.text(`Rs ${product.Price}`, 100, yPosition);
      doc.text(product.Quantity.toString(), 130, yPosition);
      doc.text(formatDate(product.Expire_Date), 160, yPosition);
      doc.text(getExpiryStatusMessage(product.Expire_Date), 200, yPosition);
  
      yPosition += 10; // Move to next row
    });
  
    // Save the PDF file
    doc.save("Product_List_Report.pdf");
  };
  

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="product-container">
      <Sidebar />
      <div className="product-content">
        <h2>Inventory List</h2>

        {/* Search Bar */}
        <input
          type="text"
          className="search-bar"
          placeholder="Search Products..."
          value={searchQuery}
          onChange={handleSearchChange}
        />

        {/* Filters */}
        <div className="filters">
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            <option value="Pantry Staples">Pantry Staples</option>
            <option value="Refrigerated Items">Refrigerated Items</option>
            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
            <option value="Cleaning Supplies">Cleaning Supplies</option>
            <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
            <option value="Health & First Aid">Health & First Aid</option>
            <option value="Home Maintenance & Tools">Home Maintenance & Tools</option>
            <option value="Other">Other</option>
          </select>

          <input
              type="date"
              className="expiry-filter"
              value={selectedExpireDate}
              onChange={handleExpireDateChange}
            />
        </div>

        <div className="button-container">
          {/* Add Product Button */}
          <button className="add-product-btn" onClick={handleAddProduct}>
            <FaPlus /> Add Product
          </button>

          {/* Report Section */}
          <div className="report-section">
            <button className="download-report-btn" onClick={generateReport}>
            


              <FaDownload /> Download Report
            </button>
          </div>

        </div>

        {/* Product List Table */}
        <table className="product-table">
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
                    <td><input type="text" name="P_name" value={updatedProduct.P_name} onChange={handleChange} /></td>
                    <td>
                      <select name="Category" value={updatedProduct.Category} onChange={handleChange}>
                        <option value="Pantry Staples">Pantry Staples</option>
                        <option value="Refrigerated Items">Refrigerated Items</option>
                        <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                        <option value="Cleaning Supplies">Cleaning Supplies</option>
                        <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
                        <option value="Health & First Aid">Health & First Aid</option>
                        <option value="Home Maintenance & Tools">Home Maintenance & Tools</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td><input type="number" name="Price" min="1" value={updatedProduct.Price} onChange={handleChange} /></td>
                    <td><input type="number" name="Quantity" min="1" value={updatedProduct.Quantity} onChange={handleChange} /></td>
                    <td><input type="date" name="Expire_Date" value={updatedProduct.Expire_Date} onChange={handleChange} min={new Date().toISOString().split("T")[0]} /></td>
                    <td>
                      <button className="icon-btn save-btn" onClick={() => saveProduct(product._id)}>
                        <FaSave />
                      </button>
                      <button className="icon-btn cancel-btn" onClick={() => setEditingProduct(null)}>
                        <FaTimes />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{product.P_name}</td>
                    <td>{product.Category}</td>
                    <td>{`Rs ${product.Price}`}</td>
                    <td>{product.Quantity}</td>
                    <td>{formatDate(product.Expire_Date)}</td>
                    <td>
                      <button className="icon-btn edit-btn" onClick={() => editProduct(product)}>
                        <FaEdit />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => deleteProduct(product._id)}>
                        <FaTrash />
                      </button>
                    </td>
                    <td>{getExpiryStatusMessage(product.Expire_Date)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
