import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/sidebar.css'; // Separate CSS file for sidebar
import logo from '../images/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <nav className="side-navbar">
      <div className="logo-container">
        <img src={logo} alt="HomeStock Logo" className="logo-dashboard" />
      </div>
      <ul>
        <li><a onClick={() => navigate('/')}>Home</a></li>
        <li><a onClick={() => navigate('/dashboard')}>Dashboard</a></li>
        <li><a onClick={() => navigate('/inventory')}>Inventory</a></li>
        <li><a onClick={() => navigate('/budget')}>Budget</a></li>
        <li><a onClick={() => navigate('/meal-planning')}>Meal Planning</a></li>
        <li><a onClick={() => navigate('/shopping-list')}>Shopping List</a></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
