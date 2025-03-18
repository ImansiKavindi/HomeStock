const { SeasonalReminder } = require("../models/seasonalReminder");

const getActiveSeasonalReminders = async (req, res) => {
    try {
        const currentDate = new Date();
        const activeReminders = await SeasonalReminder.find({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        res.status(200).json(activeReminders);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

module.exports = { getActiveSeasonalReminders };