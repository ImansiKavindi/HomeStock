import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/homepage';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/inventory'; 
import ProductList from './components/ProductList';
import SmartShoppingList from './components/SmartShoppingList';
import Reminder from "./components/Reminder";
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import ThemeProvider and createTheme

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
        <Route path="/shopping-list" element={<SmartShoppingList />} />
        <Route path="/reminders" element={<Reminder />} />
        
      </Routes>
    </ThemeProvider>
  );
}

export default App;
