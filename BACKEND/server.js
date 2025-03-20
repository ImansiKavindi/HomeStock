require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8090;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Check if the origin is either of the allowed ones
        const allowedOrigins = ['http://localhost:3002', 'http://localhost:3003'];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);  // Allow the origin
        } else {
            callback(new Error('Not allowed by CORS'));  // Reject other origins
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json()); // Using express built-in middleware for JSON parsing

// Route Imports
const productRoutes = require('./routes/ProductRoutes');

// API Routes
app.use('/api/products', productRoutes);

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
