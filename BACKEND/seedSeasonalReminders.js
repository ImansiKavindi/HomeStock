const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SeasonalReminder = require("./models/seasonalReminder");

dotenv.config(); // Load environment variables

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();

const seasonalReminders = [
    {
        season: "Sinhala and Tamil New Year",
        items: ["Oil", "Sugar", "Flour"],
        reminderDate: new Date(today.getFullYear(), 3, 1),
        message: "Sinhala and Tamil New Year is coming! Do you need more {item}?",
        month: 4,
        activeFrom: 1,
        activeTo: 12,
    },
    {
        season: "Christmas",
        items: ["Cake", "Wine", "Decorations"],
        reminderDate: new Date(today.getFullYear(), 11, 1),
        message: "Christmas is coming! Do you need more {item}?",
        month: 12,
        activeFrom: 1,
        activeTo: 24,
    },
    {
        season: "Vesak",
        items: ["Lanterns", "Oil Lamps", "Candles","Vesak Buckets"],
        reminderDate: new Date(today.getFullYear(), 4, 10),
        message: "Vesak Festival is near! Do you need more {item}?",
        month: 5,
        activeFrom: 5,
        activeTo: 15,
    },
    {
        season: "Poson",
        items: ["White Clothes", "Lamps", "Offerings"],
        reminderDate: new Date(today.getFullYear(), 5, 1),
        message: "Poson Festival is near! Do you need more {item}?",
        month: 6,
        activeFrom: 1,
        activeTo: 10,
    },
    {
        season: "Mahasivarathri",
        items: ["Incense", "Fruits", "Milk"],
        reminderDate: new Date(today.getFullYear(), 1, 10),
        message: "Mahasivarathri is coming! Do you need more {item}?",
        month: 2,
        activeFrom: 5,
        activeTo: 15,
    },
    {
        season: "Ramadan",
        items: ["Dates", "Milk", "Spices"],
        reminderDate: new Date(today.getFullYear(), 2, 15),
        message: "Ramadan is near! Stock up on {item}.",
        month: 3,
        activeFrom: 10,
        activeTo: 25,
    },
    {
        season: "Thai Pongal",
        items: ["Rice", "Jaggery", "Banana Leaves"],
        reminderDate: new Date(today.getFullYear(), 0, 10),
        message: "Thai Pongal is near! Do you need more {item}?",
        month: 1,
        activeFrom: 5,
        activeTo: 15,
    },
    {
        season: "Deepawali",
        items: ["Lamps", "Sweets", "Clothes"],
        reminderDate: new Date(today.getFullYear(), 9, 15),
        message: "Deepawali is near! Time to shop for {item}.",
        month: 10,
        activeFrom: 10,
        activeTo: 20,
    },
    {
        season: "Eid Festival",
        items: ["Meat", "New Clothes", "Sweets"],
        reminderDate: new Date(today.getFullYear(), 3, 10),
        message: "Eid Festival is approaching! Need more {item}?",
        month: 4,
        activeFrom: 5,
        activeTo: 15,
    }
];


// ✅ Connect to MongoDB with Improved Error Handling
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

// ✅ Seed only active seasonal reminders without removing all data
const seedReminders = async () => {
    try {
        await connectDB();

        // 🛑 Only delete expired reminders (keeps active ones)
        await SeasonalReminder.deleteMany({
            month: { $lt: currentMonth } // Delete past months only
        });

        const activeReminders = seasonalReminders.filter(reminder => 
            reminder.month === currentMonth && currentDay >= reminder.activeFrom && currentDay <= reminder.activeTo
        );

        if (activeReminders.length === 0) {
            console.log("⚠️ No active seasonal reminders to insert.");
            process.exit();
        }

        // ✅ Avoid duplicate insertions
        const existingSeasons = await SeasonalReminder.distinct("season");
        const newReminders = activeReminders.filter(reminder => !existingSeasons.includes(reminder.season));

        if (newReminders.length > 0) {
            await SeasonalReminder.insertMany(newReminders);
            console.log("✅ Seasonal reminders seeded successfully!");
            console.table(newReminders.map(reminder => ({
                Season: reminder.season,
                Items: reminder.items.join(", "),
            })));
        } else {
            console.log("⚠️ No new seasonal reminders to insert.");
        }

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding seasonal reminders:", error);
        process.exit(1);
    }
};

// Run the seeding function
seedReminders();
