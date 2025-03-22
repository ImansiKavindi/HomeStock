import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css'; 
import Sidebar from './Sidebar'; // Import Sidebar component
import inventoryImg from '../images/Basket.jpeg';
import budgetImg from '../images/budget.jpeg';
import mealPlanningImg from '../images/meal.jpeg';
import shoppingListImg from '../images/list.jpeg';

const Dashboard = () => {
  const navigate = useNavigate();

  const sections = [
    { id: 'inventory', title: 'Inventory', description: 'Manage your home inventory and essentials.', image: inventoryImg },
    { id: 'budget', title: 'Budget', description: 'Track and manage your household expenses and income.', image: budgetImg },
    { id: 'meal-planning', title: 'Meal Planning', description: 'Plan your meals and organize your grocery list.', image: mealPlanningImg },
    { id: 'shopping-list', title: 'Shopping List', description: 'Create and manage your shopping list efficiently.', image: shoppingListImg },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-content">
        {sections.map((section) => (
          <div key={section.id} className="dashboard-card"  onClick={() => navigate(section.id === 'shopping-list' ? '/shopping-list' : `/${section.id}`)}
>
            <img src={section.image} alt={section.title} className="card-image" />
            <div className="card-content">
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
