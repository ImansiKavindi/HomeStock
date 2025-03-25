import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/reminder.css";
import { useNavigate } from "react-router-dom";
import useFetchReminders from "../hooks/useFetchReminders"; // Import hook to fetch reminders

const Reminder = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [handledItems, setHandledItems] = useState([]); // Track dismissed reminders
  const reminderCount = useFetchReminders(); // Fetch reminder count using custom hook

  useEffect(() => {
    const storedReminders = JSON.parse(localStorage.getItem("storedReminders")) || [];
    setReminders(storedReminders); // Load stored reminders
  }, []);

  const handleStorageChange = (newCount) => {
    localStorage.setItem("reminderCount", Math.max(newCount, 0)); // Ensure non-negative count
    window.dispatchEvent(new Event("storage")); // Notify other tabs
  };

  const handleAction = async (id, item, action) => {
    try {
      await axios.post("http://localhost:8090/api/seasonal-reminders/action", { reminderId: id, item, action });

      setHandledItems((prev) => [...prev, item]); // Mark as dismissed

      // Update reminder count dynamically in localStorage
      const newCount = Math.max(reminderCount - 1, 0); // Decrease count
      localStorage.setItem("reminderCount", newCount); // Update the count in localStorage
      window.dispatchEvent(new Event("storage")); // Notify other tabs

      // Update localStorage reminders
      const updatedReminders = reminders.filter(reminder => reminder.item !== item);
      localStorage.setItem("storedReminders", JSON.stringify(updatedReminders));
      setReminders(updatedReminders); // Update reminders displayed
    } catch (error) {
      console.error(`Error ${action === "add" ? "adding item" : "skipping reminder"}:`, error);
    }
  };

  return (
    <div className="reminder-container">
      <h2>Seasonal Reminders</h2>
      {reminders.filter(reminder => !handledItems.includes(reminder.item)).length === 0 ? (
        <p>No active reminders.</p>
      ) : (
        <ul>
          {reminders
            .filter(reminder => !handledItems.includes(reminder.item))
            .map((reminder) => (
              <li key={reminder._id}>
                {reminder.message}
                <button onClick={() => handleAction(reminder._id, reminder.item, "add")}>Add</button>
                <button onClick={() => handleAction(reminder._id, reminder.item, "skip")}>Skip</button>
              </li>
            ))}
        </ul>
      )}
      <button onClick={() => navigate("/shopping-list")}>Go to Shopping List</button>
    </div>
  );
};

export default Reminder;
