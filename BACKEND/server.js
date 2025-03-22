 
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8090;

// Middleware
app.use(cors({
    origin: '*', // Temporarily allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
}));


app.use(express.json()); // Using express built-in middleware for JSON parsing

// Route Imports
const productRoutes = require('./routes/ProductRoutes');
const seasonalReminder = require("./routes/seasonalReminder");
const shoppingListRoutes = require("./routes/shoppingList"); 
const reminderRoutes = require("./routes/reminderRoutes");


// API Routes
app.use('/api/products', productRoutes);
app.use("/api/seasonal-reminders", seasonalReminder);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/reminders", reminderRoutes);




// MongoDB Connection
const URL = process.env.MONGODB_URL;
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connection Success"))
    .catch((err) => console.log("MongoDB Connection Error:", err));

// 404 Route Handling (for undefined routes)
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
});
 
