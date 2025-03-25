const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SeasonalReminder = require("./models/seasonalReminder"); // ✅ Import model

dotenv.config(); // Load environment variables

const today = new Date();
const month = today.getMonth() + 1; // ✅ Get current month
const day = today.getDate(); // ✅ Get current day

const seasonalReminders = [
    {
        season: "Sinhala and Tamil New Year",
        items: ["Oil", "Sugar", "Flour"],
        reminderDate: new Date(today.getFullYear(), 3, 1), // April 1
        message: "Sinhala and Tamil New Year is coming! Do you need more {item}?",
        month: 4, // April
        active: month === 4 && day >= 1 && day <= 12, // ✅ Active only from April 1-12
    },
    {
        season: "Christmas",
        items: ["Cake", "Wine", "Decorations"],
        reminderDate: new Date(today.getFullYear(), 11, 1), // December 1
        message: "Christmas is coming! Do you need more {item}?",
        month: 12, // December
        active: month === 12 && day >= 1 && day <= 24, // ✅ Active only from Dec 1-24
    },

    {
        season: "Easter",
        items: ["Chocolate Eggs", "Bunny Decorations", "Hot Cross Buns"],
        reminderDate: new Date(today.getFullYear(), 2, 25), // March 25
        message: "Easter is coming! Do you need more {item}?",
        month: 3, // March
        active: month === 3 && day >= 25, // ✅ Active from March 25 until Easter
    },
    {
        season: "Halloween",
        items: ["Pumpkins", "Candy", "Costumes"],
        reminderDate: new Date(today.getFullYear(), 9, 15), // October 15
        message: "Halloween is coming! Do you need more {item}?",
        month: 10, // October
        active: month === 10 && day >= 15 && day <= 31, // ✅ Active from Oct 15-31
    },
    {
        season: "Thanksgiving",
        items: ["Turkey", "Cranberry Sauce", "Pumpkin Pie"],
        reminderDate: new Date(today.getFullYear(), 10, 1), // November 1
        message: "Thanksgiving is coming! Do you need more {item}?",
        month: 11, // November
        active: month === 11 && day >= 1 && day <= 25, // ✅ Active from Nov 1-25
    },
    {
        season: "Diwali",
        items: ["Sweets", "Lamps", "Firecrackers"],
        reminderDate: new Date(today.getFullYear(), 9, 20), // October 20
        message: "Diwali is coming! Do you need more {item}?",
        month: 10, // October
        active: month === 10 && day >= 20 && day <= 31, // ✅ Active from Oct 20-31
    },
    {
        season: "Ramadan",
        items: ["Dates", "Milk", "Rice"],
        reminderDate: new Date(today.getFullYear(), 2, 10), // March 10
        message: "Ramadan is coming! Do you need more {item}?",
        month: 3, // March
        active: month === 3 && day >= 10 && day <= 30, // ✅ Active from March 10-30
    },
    {
        season: "Hanukkah",
        items: ["Candles", "Dreidels", "Latkes"],
        reminderDate: new Date(today.getFullYear(), 11, 5), // December 5
        message: "Hanukkah is coming! Do you need more {item}?",
        month: 12, // December
        active: month === 12 && day >= 5 && day <= 20, // ✅ Active from Dec 5-20
    },
     
];

// ✅ Connect to MongoDB
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

// ✅ Insert only active reminders
const seedReminders = async () => {
    try {
        await connectDB();
        await SeasonalReminder.deleteMany(); // Clear old data
        const activeReminders = seasonalReminders.filter(reminder => reminder.active);
        await SeasonalReminder.insertMany(activeReminders);
        console.log("✅ Seasonal reminders seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding seasonal reminders:", error);
        process.exit(1);
    }
};

seedReminders();
 