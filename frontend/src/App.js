import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/homepage';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/inventory'; 
import ProductList from './components/ProductList';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import ThemeProvider and createTheme
//meal planning
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AddMealPlan from "./pages/AddMealPlan";
import MealPlanList from "./pages/MealPlanList";


// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>  {/* Wrap your components with ThemeProvider */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<ProductList />} /> {/* Inventory route */}
        <Route path="/add-product" element={<InventoryPage />} />
        
        
      </Routes>
    </ThemeProvider>

    
    
  );
  }

  //meal planning
  function App() {
    return (
      <Router>
        <nav>
          <Link to="/">Home</Link> | 
          <Link to="/add-meal"> Add Meal Plan</Link> | 
          <Link to="/meal-plans">Meal Plans</Link>
        </nav>
  
        <Routes>
          <Route path="/add-meal" element={<AddMealPlan />} />
          <Route path="/meal-plans" element={<MealPlanList />} />
          <Route path="/" element={<h2>Welcome to HomeStock</h2>} />
        </Routes>
      </Router>
    );
}

export default App;
