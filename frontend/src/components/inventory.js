import React, { useState } from 'react';
import Sidebar from './Sidebar'; // Importing the sidebar
import Swal from 'sweetalert2'; // SweetAlert for success/error messages
import '../css/inventory.css'; // Import your CSS file for styles

const AddProduct = () => {
  const [P_name, setP_name] = useState('');
  const [Category, setCategory] = useState('');
  const [Price, setPrice] = useState('');
  const [Quantity, setQuantity] = useState('');
  const [Expire_Date, setExpire_Date] = useState(''); // Ensure correct state name
  const [P_Image, setP_Image] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleFileChange = (e) => {
    setP_Image(e.target.files[0]);
  };

  const isPastDate = (date) => {
    const today = new Date();
    const inputDate = new Date(date);
    return inputDate < today;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!P_name || !Category || !Price || !Quantity || !Expire_Date) {
      setError('All fields are required.');
      return;
    }

    if (Price <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    if (Quantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (isPastDate(Expire_Date)) {
      setError('Expiration date cannot be in the past.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('P_name', P_name);
    formData.append('Category', Category);
    formData.append('Price', Price);
    formData.append('Quantity', Quantity);
    formData.append('Expire_Date', Expire_Date);

    if (P_Image) {
      formData.append('P_Image', P_Image);
    }

    // Debugging: Check FormData values
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch('http://localhost:8090/api/products/create', {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error("Invalid JSON response from server:", error);
        throw new Error("Unexpected server response.");
      }

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Product Added!',
          text: 'Product has been added successfully.',
        });

        // Reset form fields
        setP_name('');
        setCategory('');
        setPrice('');
        setQuantity('');
        setExpire_Date('');
        setP_Image(null);
      } else {
        setError(data.message || 'An error occurred');
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.message || 'Something went wrong.',
        });
      }
    } catch (err) {
      setError('Network error: Unable to add product');
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Unable to add product. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventory-container">
      <Sidebar />
      <div className="form-container">
        <h1>Add Product</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="column">
              <label>Product Name:</label>
              <input
                type="text"
                value={P_name}
                onChange={(e) => setP_name(e.target.value)}
              />
            </div>
            <div className="column">
              <label>Category:</label>
              <select value={Category} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                <option value="Pantry Staples">Pantry Staples</option>
                <option value="Refrigerated Items">Refrigerated Items</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Cleaning Supplies">Cleaning Supplies</option>
                <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
                <option value="Health & First Aid">Health & First Aid</option>
                <option value="Home Maintenance & Tools">Home Maintenance & Tools</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="column">
              <label>Price:</label>
              <input
                type="number"
                value={Price}
                onChange={(e) => setPrice(e.target.value)}
                min="1"
              />
            </div>
            <div className="column">
              <label>Quantity:</label>
              <input
                type="number"
                value={Quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div className="row">
            <div className="column">
              <label>Expiration Date:</label>
              <input
                type="date"
                value={Expire_Date}
                onChange={(e) => setExpire_Date(e.target.value)}
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
              />
            </div>
            <div className="column">
              <label>Product Image (optional):</label>
              <input type="file" onChange={handleFileChange} />
            </div>
          </div>

          <div className="addbutton-container">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
