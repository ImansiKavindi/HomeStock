import { useState, useEffect } from "react";

const useFetchReminders = () => {
    const [reminderCount, setReminderCount] = useState(() => {
        return Number(localStorage.getItem("reminderCount")) || 0;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const newCount = Number(localStorage.getItem("reminderCount")) || 0;
            setReminderCount(newCount); // This will update the state in the component
        };

        // Listen for changes in localStorage from other tabs or components
        window.addEventListener("storage", handleStorageChange);

        // Sync count when component mounts
        handleStorageChange();

        // Cleanup listener when the component unmounts
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []); // Run once when the component mounts

    return reminderCount;
};

export default useFetchReminders;
