
require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8090;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));




app.use(bodyParser.json());
app.use(express.json()); 

// Route Imports
const productRoutes = require('./routes/ProductRoutes');
const seasonalReminder = require("./routes/seasonalReminder");
const shoppingListRoutes = require("./routes/shoppingList"); 


// API Routes
app.use('/api/products', productRoutes);
app.use("/api/seasonal-reminders", seasonalReminder);
app.use("/api/shopping-list", shoppingListRoutes);

// MongoDB Connection
const URL = process.env.MONGODB_URL;
mongoose.connect(URL);

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB Connection Success");
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);

});