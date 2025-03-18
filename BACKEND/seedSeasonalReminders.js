const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SeasonalReminder = require("./models/seasonalReminder"); // ✅ Import model

dotenv.config(); // Load environment variables

const today = new Date();

const seasonalReminders = [
    {
        season: "Sinhala and Tamil New Year",
        items: ["Oil", "Sugar", "Flour"],
        reminderDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()), // ✅ Today's date
        message: "Sinhala and Tamil New Year is coming! Do you need more {item}?",
        month: today.getMonth() + 1, // ✅ Current month
        active: true,
    },
    {
        season: "Christmas",
        items: ["Cake", "Wine", "Decorations"],
        reminderDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()), // ✅ Today's date
        message: "Christmas is coming! Do you need more {item}?",
        month: today.getMonth() + 1, // ✅ Current month
        active: true,
    },
];

// ✅ Connect to MongoDB directly
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected!");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

const seedReminders = async () => {
    try {
        await connectDB(); // ✅ Connect to MongoDB
        await SeasonalReminder.deleteMany(); // ✅ Clear old data
        await SeasonalReminder.insertMany(seasonalReminders); // ✅ Insert new data
        console.log("✅ Seasonal reminders seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding seasonal reminders:", error);
        process.exit(1);
    }
};

seedReminders();
