import React from 'react';
import '../css/Dashboard.css'; // Import CSS file for dashboard styling

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Side Navbar */}
      <nav className="side-navbar">
        <ul>
          <li><a href="#inventory">Inventory</a></li>
          <li><a href="#budget">Budget</a></li>
          <li><a href="#meal-planning">Meal Planning</a></li>
          <li><a href="#shopping-list">Shopping List</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <section id="inventory">
          <h2>Inventory</h2>
          <p>Manage your home inventory and essentials.</p>
        </section>

        <section id="budget">
          <h2>Budget</h2>
          <p>Track and manage your household expenses and income.</p>
        </section>

        <section id="meal-planning">
          <h2>Meal Planning</h2>
          <p>Plan your meals and organize your grocery list.</p>
        </section>

        <section id="shopping-list">
          <h2>Shopping List</h2>
          <p>Create and manage your shopping list efficiently.</p>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
