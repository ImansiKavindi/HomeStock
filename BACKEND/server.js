require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path'); 

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

// Serve static files


// Route Imports
const productRoutes = require('./routes/ProductRoutes');
const mealPlanRoutes = require('./routes/MealPlanRoutes');



// API Routes
app.use('/api/products', productRoutes);
app.use('/api/meal-plans', mealPlanRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files


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
