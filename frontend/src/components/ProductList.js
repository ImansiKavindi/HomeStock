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
 
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpireDate, setSelectedExpireDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  //const [selectedQuantity, setSelectedQuantity] = useState("");  // Flag to differentiate
  const [updatedProduct, setUpdatedProduct] = useState({
    Quantity: {
      value: '',
      unit: ''
    }
  });
  

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
    setUpdatedProduct({ ...product }); // Set the full product object to the updated state
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

    // Background Image
    const backgroundUrl = '../images/bg.jpeg';
    doc.addImage(backgroundUrl, 'JPEG', 0, 0, 770, 100);

    // Logo
    const logoUrl = '../images/logo.png';
    doc.addImage(logoUrl, 'PNG', 10, 8, 30, 30);

    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 128, 0);
    doc.setFont("helvetica", "bold");
    doc.text("HomeStock", 45, 25);

    // Separator Line
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 40, 200, 40);

    // Subtitle
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("Product List Report", 14, 55);

    doc.setFont("helvetica", "normal");

    // Header Background
doc.setFillColor(193, 225, 193);
doc.rect(10, 70, 190, 12, "F"); // Filled rectangle without border

// Draw only the top, left, and right borders (excluding the bottom)
doc.setDrawColor(0, 0, 0);
doc.line(10, 70, 200, 70); // Top border
doc.line(10, 70, 10, 82); // Left border
doc.line(200, 70, 200, 82); // Right border


    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Name", 12, 76);
    doc.text("Category", 50, 76);
    doc.text("Price", 90, 76);
    doc.text("Quantity", 115, 76);
    doc.text("Expiry Date", 145, 76);
    doc.text("Expiry Status", 170, 76);

    let yPosition = 87;
    let expiredCount = 0;
    let totalWasted = 0;

    // Function to handle text wrapping
    const splitText = (text, maxWidth) => doc.splitTextToSize(text, maxWidth);

    // Loop Through Products & Add Data
    filteredProducts.forEach((product) => {
        const expiryStatus = getExpiryStatusMessage(product.Expire_Date);
        const price = `Rs ${product.Price}`;
        const quantityText = `${product.Quantity?.value || "N/A"} ${product.Quantity?.unit || ""}`;
        const expiryDate = formatDate(product.Expire_Date);

        // Wrap text if too long
        const categoryLines = splitText(product.Category, 35);
        const priceLines = splitText(price, 20);
        const expiryDateLines = splitText(expiryDate, 25);
        const expiryStatusLines = splitText(expiryStatus, 30);
        const rowHeight = Math.max(categoryLines.length, priceLines.length, expiryDateLines.length, expiryStatusLines.length) * 7;

        // Draw Table Borders
        doc.setDrawColor(0, 0, 0);
        doc.rect(10, yPosition - 5, 190, rowHeight); // Full row border

        // Normal Text Color (Black)
        doc.setTextColor(0, 0, 0);
        doc.text(product.P_name, 12, yPosition);
        doc.text(categoryLines, 50, yPosition);
        doc.text(priceLines, 90, yPosition);
        doc.text(quantityText, 115, yPosition);
        doc.text(expiryDateLines, 145, yPosition);

        // Expiry Status in Red if Expired
        if (expiryStatus.includes("Expired today") || expiryStatus.includes("Already expired")) {
            doc.setTextColor(255, 0, 0); // Red
            expiredCount += 1;
            totalWasted += product.Price;
        } else {
            doc.setTextColor(0, 0, 0); // Default Black
        }

        doc.text(expiryStatusLines, 170, yPosition);
        yPosition += rowHeight;
    });

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 0);
    doc.text("Total Expired Products:", 10, yPosition + 10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${expiredCount}`, 65, yPosition + 10);

    doc.setTextColor(0, 128, 0);
    doc.text("Total Wasted Value:", 10, yPosition + 20);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rs ${totalWasted}`, 58, yPosition + 20);

    // Footer Line Separator
    doc.setDrawColor(0, 0, 0);
    doc.line(10, yPosition + 30, 200, yPosition + 30);

    // Date & Time
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Generated on: " + new Date().toLocaleString(), 10, yPosition + 35);

    // Save the PDF
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
            <button className="report-btn" onClick={generateReport}>
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
                    <td>
  <input
    type="number"
    name="Quantity_value"
    min="1"
    value={updatedProduct.Quantity?.value || ""}  // Safe fallback to empty string
    onChange={(e) => setUpdatedProduct({
      ...updatedProduct,
      Quantity: {
        ...updatedProduct.Quantity,
        value: e.target.value
      }
    })}
  />
  <select
    name="Quantity_unit"
    value={updatedProduct.Quantity?.unit || ""}  // Safe fallback to empty string
    onChange={(e) => setUpdatedProduct({
      ...updatedProduct,
      Quantity: {
        ...updatedProduct.Quantity,
        unit: e.target.value
      }
    })}
  >
    <option value="kg">Kilograms (kg)</option>
    <option value="L">Liters (L)</option>
    <option value="pieces">Pieces</option>
    <option value="g">Grams (g)</option>
    <option value="ml">Milliliters (ml)</option>
    <option value="packs">Packs</option>
    <option value="Bottles">Bottles</option>
  </select>
</td>

                    <td><input type="date" name="Expire_Date" value={updatedProduct.Expire_Date} onChange={handleChange} /></td>
                    <td>
                      <button className="save-btn" onClick={() => saveProduct(product._id)}>
                        <FaSave />
                      </button>
                      <button className="cancel-btn" onClick={() => setEditingProduct(null)}>
                        <FaTimes />
                      </button>
                    </td>
                    <td>{getExpiryStatusMessage(updatedProduct.Expire_Date)}</td>
                  </>
                ) : (
                  <>
                    <td>{product.P_name}</td>
                    <td>{product.Category}</td>
                    <td>{`Rs ${product.Price}`}</td>
                    <td>{`${product.Quantity?.value} ${product.Quantity?.unit}`}</td>
                    <td>{formatDate(product.Expire_Date)}</td>
                    <td>
                      <button className="edit-btn" onClick={() => editProduct(product)}>
                        <FaEdit />
                      </button>
                      <button className="delete-btn" onClick={() => deleteProduct(product._id)}>
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
