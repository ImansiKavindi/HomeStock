require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path'); 
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8090;

// ✅ Proper CORS Configuration
app.use(cors({
    origin: /http:\/\/localhost:\d+/, // Allows localhost on any port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json()); // Parse JSON requests

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Uploads directory created");
}

// Route Imports
const productRoutes = require('./routes/ProductRoutes');
const mealPlanRoutes = require('./routes/MealPlanRoutes');
// These routes will be added by other team members
// const expenseRoutes = require('./routes/ExpenseRoutes');
// const budgetRoutes = require('./routes/BudgetRoutes');
// const notificationRoutes = require('./routes/NotificationRoutes');

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
// These routes will be added by other team members
// app.use('/api/expenses', expenseRoutes);
// app.use('/api/budgets', budgetRoutes);
// app.use('/api/notifications', notificationRoutes);

// MongoDB Connection
const URL = process.env.MONGODB_URL;
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connection Success"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// 404 Route Handling
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is up and running on port: ${PORT}`);
});
