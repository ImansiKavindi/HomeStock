import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/homepage';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/inventory'; 
import ProductList from './components/ProductList';
import MealPlanning from './components/mealplanning/MealPlanning';
import RecipeList from './components/mealplanning/RecipeList';
import RecipeDetails from './components/mealplanning/RecipeDetails';
import CreateRecipe from './components/mealplanning/CreateRecipe';
import MealPlanList from './components/mealplanning/MealPlanList';
import MealPlanDetails from './components/mealplanning/MealPlanDetails';
import CreateMealPlan from './components/mealplanning/CreateMealPlan';
import ExpenseTracker from './components/ExpenseTracker';
import Budget from './components/Budget';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import createEmotionCache from './createEmotionCache';

// Client-side cache, shared for the whole session
const clientSideEmotionCache = createEmotionCache();

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
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
  },
});

function App() {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<ProductList />} />
          <Route path="/add-product" element={<InventoryPage />} />
          <Route path="/expense-tracker" element={<ExpenseTracker />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/meal-planning" element={<MealPlanning />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/create-meal-plan" element={<CreateMealPlan />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/meal-plan/:id" element={<MealPlanDetails />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
