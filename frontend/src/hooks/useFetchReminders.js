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

        window.addEventListener("storage", handleStorageChange);

        // Sync count when component mounts
        handleStorageChange();

        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return reminderCount;
};

export default useFetchReminders;
 