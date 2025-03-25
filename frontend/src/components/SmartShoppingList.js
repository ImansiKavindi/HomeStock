import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/shoppingList.css";
import useFetchReminders from "../hooks/useFetchReminders"; // Import hook to fetch reminders
import Dashboard from "./Dashboard"; // Import Dashboard component

const SmartShoppingList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");
  const reminderCount = useFetchReminders(); // Get reminder count using custom hook

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:8090/api/shopping-list");
        setItems(response.data.items || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, [reminderCount]);

  const handleReadyToShop = async () => {
    try {
      const response = await axios.get("http://localhost:8090/api/seasonal-reminders/active");
      const activeReminders = response.data || [];
      localStorage.setItem("reminderCount", activeReminders.length);
      localStorage.setItem("storedReminders", JSON.stringify(activeReminders));
      window.dispatchEvent(new Event("storage"));
      navigate("/reminders");
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const handleAddItem = async () => {
    if (newItem.trim() === "") return;
    if (items.includes(newItem.trim())) {
      alert("This item is already in the list.");
      return;
    }
    try {
      await axios.post("http://localhost:8090/api/shopping-list/add", { item: newItem.trim() });
      setNewItem("");
      setItems([...items, newItem.trim()]);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item]
    );
  };

  const handleEditItem = () => {
    if (selectedItems.length === 1) {
      setEditingItem(selectedItems[0]);
      setEditValue(selectedItems[0]);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || editValue.trim() === "") return;
    try {
      await axios.post("http://localhost:8090/api/shopping-list/update", {
        oldItem: editingItem,
        newItem: editValue.trim(),
      });
      setEditingItem(null);
      setEditValue("");
      setSelectedItems([]);
      setItems(items.map((item) => (item === editingItem ? editValue.trim() : item)));
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return alert("No items selected.");
    if (!window.confirm("Are you sure you want to remove the selected items?")) return;
    try {
      await axios.post("http://localhost:8090/api/shopping-list/remove", { itemsToRemove: selectedItems });
      setItems(items.filter((item) => !selectedItems.includes(item)));
      setSelectedItems([]);
    } catch (error) {
      console.error("Error removing items:", error);
    }
  };

  const handleClearList = async () => {
    if (!window.confirm("Are you sure you want to clear the shopping list?")) return;
    try {
      await axios.delete("http://localhost:8090/api/shopping-list/clear");
      setItems([]);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error clearing shopping list:", error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get("http://localhost:8090/api/shopping-list/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "shopping_list.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading shopping list:", error);
    }
  };

  return (
    <div className="shopping-list-container">
      {/* Wrap both components in a parent div */}
      <div className="shopping-list-wrapper">
        {/* Left side: Dashboard */}
        <div className="dashboard-section">
          <Dashboard />
        </div>

        {/* Right side: Smart Shopping List */}
        <div className="shopping-list-section">
          <h1>Smart Shopping List</h1>
          <button onClick={() => navigate("/reminders")}>Reminders ({reminderCount})</button>
          <button onClick={handleReadyToShop}>Ready to Shop</button>

          {/* Add Item Section */}
          <div className="add-item-section">
            <input
              type="text"
              placeholder="Enter item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="item-input"
            />
            <button onClick={handleAddItem}>Add Item</button>
          </div>

          {/* Shopping List */}
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {editingItem === item ? (
                  <>
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                    <button onClick={handleUpdateItem}>Save</button>
                    <button onClick={() => setEditingItem(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{item}</span>
                    <input type="checkbox" checked={selectedItems.includes(item)} onChange={() => handleSelectItem(item)} />
                  </>
                )}
              </li>
            ))}
          </ul>

          <button onClick={handleEditItem} disabled={selectedItems.length !== 1}>Edit Selected</button>
          <button onClick={handleRemoveSelected} disabled={selectedItems.length === 0}>Remove Selected</button>
          <button onClick={handleClearList}>Clear List</button>
          <button onClick={handleDownloadPDF}>Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default SmartShoppingList;
