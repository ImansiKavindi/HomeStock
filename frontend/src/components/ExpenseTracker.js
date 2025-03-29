import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../css/ExpenseTracker.css';

const API_URL = 'http://localhost:8090/api/expenses';

// Category and subcategory mapping
const categorySubcategoryMap = {
  'Groceries': ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Snacks', 'Beverages', 'Canned Goods', 'Frozen Foods', 'Other'],
  'Utilities': ['Electricity', 'Water', 'Gas', 'Internet', 'Phone', 'Cable TV', 'Garbage', 'Other'],
  'Housing': ['Rent', 'Mortgage', 'Insurance', 'Maintenance', 'Property Tax', 'HOA Fees', 'Furniture', 'Appliances', 'Other'],
  'Transportation': ['Fuel', 'Car Payment', 'Insurance', 'Maintenance', 'Public Transport', 'Parking', 'Tolls', 'Ride Share', 'Other'],
  'Entertainment': ['Movies', 'Music', 'Books', 'Games', 'Concerts', 'Sports Events', 'Streaming Services', 'Hobbies', 'Other'],
  'Healthcare': ['Doctor Visits', 'Medications', 'Insurance', 'Dental', 'Vision', 'Fitness', 'Other'],
  'Education': ['Tuition', 'Books', 'Supplies', 'Courses', 'Student Loan', 'Other'],
  'Personal Care': ['Haircuts', 'Spa', 'Cosmetics', 'Toiletries', 'Laundry', 'Other'],
  'Dining Out': ['Breakfast', 'Lunch', 'Dinner', 'Coffee', 'Fast Food', 'Fine Dining', 'Delivery', 'Other'],
  'Travel': ['Flights', 'Hotels', 'Car Rental', 'Activities', 'Food', 'Souvenirs', 'Other'],
  'Clothing': ['Casual', 'Formal', 'Shoes', 'Accessories', 'Seasonal', 'Other'],
  'Home Improvement': ['Repairs', 'Renovations', 'Decor', 'Gardening', 'Tools', 'Other'],
  'Electronics': ['Devices', 'Accessories', 'Repairs', 'Software', 'Other'],
  'Gifts': ['Birthday', 'Holiday', 'Wedding', 'Anniversary', 'Charity', 'Other'],
  'Other': ['Miscellaneous']
};

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    subcategory: '',
    amount: ''
  });
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_URL);
      setExpenses(res.data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Swal.fire('Error', 'Failed to load expenses', 'error');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle category change and update subcategories
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({
      ...formData,
      category: selectedCategory,
      subcategory: '' // Reset subcategory when category changes
    });
    setAvailableSubcategories(categorySubcategoryMap[selectedCategory] || []);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit form to add or update expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.itemName || !formData.category || !formData.subcategory || !formData.amount) {
      Swal.fire('Error', 'Please fill all fields', 'error');
      return;
    }

    try {
      if (editingExpense) {
        // Update existing expense
        await axios.put(`${API_URL}/${editingExpense}`, formData);
        Swal.fire('Success', 'Expense updated successfully', 'success');
      } else {
        // Create new expense
        await axios.post(`${API_URL}/create`, formData);
        Swal.fire('Success', 'Expense added successfully', 'success');
      }
      
      // Reset form and refresh expenses
      setFormData({ itemName: '', category: '', subcategory: '', amount: '' });
      setEditingExpense(null);
      setAvailableSubcategories([]);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      Swal.fire('Error', 'Failed to save expense', 'error');
    }
  };

  // Edit an expense
  const handleEdit = (expense) => {
    setEditingExpense(expense._id);
    setFormData({
      itemName: expense.itemName,
      category: expense.category,
      subcategory: expense.subcategory,
      amount: expense.amount
    });
    setAvailableSubcategories(categorySubcategoryMap[expense.category] || []);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingExpense(null);
    setFormData({ itemName: '', category: '', subcategory: '', amount: '' });
    setAvailableSubcategories([]);
  };

  // Delete an expense
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this expense!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/${id}`);
          fetchExpenses();
          Swal.fire('Deleted!', 'The expense has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting expense:', error);
          Swal.fire('Error!', 'Failed to delete expense.', 'error');
        }
      }
    });
  };

  // Format amount as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="expense-container">
      <Sidebar />
      <div className="expense-content">
        <h2 className="expense-header">Expense Tracker</h2>
        
        {/* Expense Form */}
        <div className="expense-form-container">
          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="itemName">Item Name</label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter item name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
              >
                <option value="">Select a category</option>
                {Object.keys(categorySubcategoryMap).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="subcategory">Subcategory</label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                disabled={!formData.category}
              >
                <option value="">Select a subcategory</option>
                {availableSubcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <button type="submit" className="add-expense-btn">
                {editingExpense ? (
                  <>
                    <FaSave /> Update Expense
                  </>
                ) : (
                  <>
                    <FaPlus /> Add Expense
                  </>
                )}
              </button>
              {editingExpense && (
                <button
                  type="button"
                  className="add-expense-btn"
                  onClick={handleCancelEdit}
                  style={{ marginLeft: '10px', background: '#f44336' }}
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Expenses Grid */}
        <h3 style={{ marginTop: '30px', color: '#2e7d32' }}>Your Expenses</h3>
        {expenses.length === 0 ? (
          <div className="no-expenses">No expenses added yet</div>
        ) : (
          <div className="expenses-grid">
            {expenses.map((expense) => (
              <div key={expense._id} className="expense-card">
                <h3>{expense.itemName}</h3>
                <div className="expense-meta">
                  <span className="expense-category">{expense.category}</span>
                  <span className="expense-subcategory">{expense.subcategory}</span>
                </div>
                <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                <div style={{ fontSize: '14px', color: '#757575', marginTop: '5px' }}>
                  {expense.date && formatDate(expense.date)}
                </div>
                <div className="expense-actions">
                  <button
                    className="expense-edit-btn"
                    onClick={() => handleEdit(expense)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="expense-delete-btn"
                    onClick={() => handleDelete(expense._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker; 