import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { FaSave, FaDollarSign, FaChartLine, FaMoneyBillWave, FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../css/Budget.css';

const BUDGET_API_URL = 'http://localhost:8090/api/budgets';
const EXPENSE_API_URL = 'http://localhost:8090/api/expenses';

const Budget = () => {
  const [budget, setBudget] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetStatus, setBudgetStatus] = useState({
    totalExpenses: 0,
    remaining: 0,
    percentUsed: 0,
    isExceeded: false
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current budget
  const fetchBudget = async () => {
    try {
      const res = await axios.get(BUDGET_API_URL);
      setBudget(res.data.budget);
      return res.data.budget;
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching budget:', error);
      }
      return null;
    }
  };

  // Fetch budget status
  const fetchBudgetStatus = async () => {
    try {
      const res = await axios.get(`${BUDGET_API_URL}/status`);
      setBudgetStatus(res.data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching budget status:', error);
      }
    }
  };

  // Fetch recent expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(EXPENSE_API_URL);
      setExpenses(res.data.expenses.slice(0, 5)); // Get only the 5 most recent expenses
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    const budgetData = await fetchBudget();
    if (budgetData) {
      await fetchBudgetStatus();
    }
    await fetchExpenses();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle budget form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      Swal.fire('Error', 'Please enter a valid budget amount', 'error');
      return;
    }
    
    try {
      await axios.post(`${BUDGET_API_URL}/set`, { amount: parseFloat(budgetAmount) });
      Swal.fire('Success', 'Budget has been set successfully', 'success');
      loadData();
      setBudgetAmount('');
    } catch (error) {
      console.error('Error setting budget:', error);
      Swal.fire('Error', 'Failed to set budget', 'error');
    }
  };

  // Format currency
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

  // Get color class for progress bar
  const getProgressBarClass = (percent) => {
    if (percent >= 100) return 'progress-danger';
    if (percent >= 75) return 'progress-warning';
    return 'progress-normal';
  };

  // Generate and download PDF report
  const downloadPdfReport = async () => {
    try {
      Swal.fire({
        title: 'Generating report',
        text: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Make request to generate report and receive file
      const response = await axios.get(`${BUDGET_API_URL}/report`, {
        responseType: 'blob'
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `budget-report-${new Date().getTime()}.pdf`);
      
      // Append to html page and click the link to trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Budget report downloaded successfully'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download the budget report'
      });
    }
  };

  return (
    <div className="budget-container">
      <Sidebar />
      <NotificationBell />
      
      <div className="budget-content">
        <h2 className="budget-header">Budget Management</h2>
        
        {/* Budget Form */}
        <div className="budget-settings">
          <h3 className="settings-title">Set or Update Your Budget</h3>
          <form className="budget-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="budgetAmount">Budget Amount</label>
              <input
                type="number"
                id="budgetAmount"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder={budget ? `Current: ${formatCurrency(budget.amount)}` : "Enter amount"}
                min="0"
                step="0.01"
              />
            </div>
            <button type="submit" className="set-budget-btn">
              <FaSave style={{ marginRight: '8px' }} />
              {budget ? 'Update Budget' : 'Set Budget'}
            </button>
          </form>
        </div>
        
        {loading ? (
          <div className="loading" style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        ) : budget ? (
          <>
            {/* PDF Report Button */}
            <div className="report-section">
              <button 
                className="download-report-btn" 
                onClick={downloadPdfReport}
              >
                <FaFilePdf style={{ marginRight: '8px' }} />
                Download PDF Report
              </button>
            </div>
            
            {/* Budget Summary */}
            <div className="budget-summary">
              <div className="summary-card budget">
                <div className="summary-title">Total Budget</div>
                <div className="summary-value">{formatCurrency(budget.amount)}</div>
                <FaDollarSign style={{ fontSize: '24px', color: '#2e7d32', marginTop: '10px' }} />
              </div>
              
              <div className="summary-card expenses">
                <div className="summary-title">Total Expenses</div>
                <div className="summary-value">{formatCurrency(budgetStatus.totalExpenses)}</div>
                <FaChartLine style={{ fontSize: '24px', color: '#ff9800', marginTop: '10px' }} />
              </div>
              
              <div className={`summary-card ${budgetStatus.isExceeded ? 'exceeded' : 'remaining'}`}>
                <div className="summary-title">{budgetStatus.isExceeded ? 'Over Budget' : 'Remaining'}</div>
                <div className="summary-value">
                  {formatCurrency(Math.abs(budgetStatus.remaining))}
                </div>
                <FaMoneyBillWave style={{ 
                  fontSize: '24px', 
                  color: budgetStatus.isExceeded ? '#f44336' : '#2196f3', 
                  marginTop: '10px' 
                }} />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="budget-progress">
              <div 
                className={`progress-bar ${getProgressBarClass(budgetStatus.percentUsed)}`}
                style={{ width: `${Math.min(budgetStatus.percentUsed, 100)}%` }}
              ></div>
            </div>
            
            {/* Recent Expenses */}
            <div className="expenses-section">
              <h3 className="section-title">Recent Expenses</h3>
              
              {expenses.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#757575' }}>No expenses recorded yet</p>
              ) : (
                <table className="expense-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{expense.itemName}</td>
                        <td>
                          <span className="category-badge">{expense.category}</span>
                        </td>
                        <td className="amount-column">{formatCurrency(expense.amount)}</td>
                        <td className="date-column">{formatDate(expense.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="no-budget-message">
            <p>No budget set yet. Please set a budget to track your expenses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget; 