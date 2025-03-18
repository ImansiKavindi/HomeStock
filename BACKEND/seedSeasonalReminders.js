require("dotenv").config();
const mongoose = require("mongoose");
const { SeasonalReminder } = require("./models/seasonalReminder");

// ✅ Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Insert Hardcoded Seasonal Data
const insertHardcodedSeasonalReminders = async () => {
    try {
        const count = await SeasonalReminder.countDocuments();
        console.log(`📊 Existing Seasonal Reminders Count: ${count}`);

        if (count === 0) {
            console.log("⚡ Inserting hardcoded seasonal reminders...");

            const seasonalReminders = [
                {
                    itemName: "Oil",
                    season: "Sinhala and Tamil New Year",
                    reminderDate: new Date("2025-04-01"),
                    message: "Do you need more oil for New Year?",
                    userId: "65f123456789abcd12345678", // Replace with actual user ID
                },
                {
                    itemName: "Sugar",
                    season: "Sinhala and Tamil New Year",
                    reminderDate: new Date("2025-04-01"),
                    message: "Do you need more sugar for New Year?",
                    userId: "65f123456789abcd12345678",
                },
                {
                    itemName: "Flour",
                    season: "Sinhala and Tamil New Year",
                    reminderDate: new Date("2025-04-01"),
                    message: "Do you need more flour for New Year?",
                    userId: "65f123456789abcd12345678",
                },
                {
                    itemName: "Cake Ingredients",
                    season: "Christmas",
                    reminderDate: new Date("2025-12-01"),
                    message: "Do you need more cake ingredients for Christmas?",
                    userId: "65f123456789abcd12345678",
                },
                {
                    itemName: "Wine",
                    season: "Christmas",
                    reminderDate: new Date("2025-12-01"),
                    message: "Do you need more wine for Christmas?",
                    userId: "65f123456789abcd12345678",
                },
                {
                    itemName: "Decorations",
                    season: "Christmas",
                    reminderDate: new Date("2025-12-01"),
                    message: "Do you need more decorations for Christmas?",
                    userId: "65f123456789abcd12345678",
                },
            ];

            await SeasonalReminder.insertMany(seasonalReminders);
            console.log("✅ Seasonal reminders inserted successfully!");
        } else {
            console.log("⏩ Seasonal reminders already exist. No new data inserted.");
        }
    } catch (error) {
        console.error("❌ Error inserting seasonal reminders:", error);
    } finally {
        mongoose.connection.close();
    }
};

// ✅ Run the function
insertHardcodedSeasonalReminders();
