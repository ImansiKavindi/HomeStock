import React, { useState, useEffect } from "react";
import "../css/shoppingList.css";

const SmartShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");

  // ✅ Fetch items from backend
  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/shopping-list");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ Add an item
  const handleAddItem = async () => {
    if (newItem.trim() === "") return;
    try {
      await fetch("http://localhost:8090/api/shopping-list/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: newItem.trim() }),
      });
      setNewItem("");
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // ✅ Select an item (checkbox toggle)
  const handleSelectItem = (item) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item]
    );
  };

  // ✅ Remove selected items
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return alert("No items selected.");
    
    try {
      await fetch("http://localhost:8090/api/shopping-list/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemsToRemove: selectedItems }),
      });
      setSelectedItems([]);
      fetchItems();
    } catch (error) {
      console.error("Error removing items:", error);
    }
  };

  // ✅ Update an item
  const handleUpdateItem = async () => {
    if (!editingItem || editValue.trim() === "") return;

    try {
      await fetch("http://localhost:8090/api/shopping-list/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldItem: editingItem, newItem: editValue.trim() }),
      });
      setEditingItem(null);
      setEditValue("");
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // ✅ Download shopping list as PDF
  const handleDownloadPDF = () => {
    window.open("http://localhost:8090/api/shopping-list/download", "_blank");
  };

  // ✅ Clear the entire shopping list (With Confirmation)
  const handleClearList = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear the shopping list?");
    if (!confirmClear) return;
  
    try {
      const response = await fetch("http://localhost:8090/api/shopping-list/clear", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error("Failed to clear shopping list");
      }
  
      fetchItems(); // ✅ Refresh list after clearing
    } catch (error) {
      console.error("Error clearing shopping list:", error);
    }
  };

  return (
    <div className="shopping-list-container">
      <h1>Smart Shopping List</h1>

      {/* ✅ Add Item Section */}
      <div className="add-item-section">
        <input
          type="text"
          placeholder="Enter item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="item-input"
        />
        <button className="add-button" onClick={handleAddItem}>Add Item</button>
      </div>

      {/* ✅ Shopping List Items */}
      <div className="shopping-list-items">
        {items.length === 0 ? (
          <p>Your shopping list is empty.</p>
        ) : (
          <ul>
            {items.map((item, index) => (
              <li key={index} className="shopping-list-item">
                {/* ✅ Item Name on Left */}
                {editingItem === item ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="edit-input"
                    />
                    <button onClick={handleUpdateItem} className="update-button">Save</button>
                    <button onClick={() => setEditingItem(null)} className="cancel-button">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="item-text">{item}</span>

                    {/* ✅ Checkbox on Right */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item)}
                      onChange={() => handleSelectItem(item)}
                      className="item-checkbox"
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Show Buttons Only If Items Are Selected */}
      {selectedItems.length > 0 && (
        <div className="action-buttons">
          <button className="edit-button" onClick={() => setEditingItem(selectedItems[0])}>Edit</button>
          <button className="remove-button" onClick={handleRemoveSelected}>Remove Selected</button>
        </div>
      )}

      {/* ✅ Other Action Buttons */}
      <div className="action-buttons">
        <button className="download-button" onClick={handleDownloadPDF}>Download PDF</button>
        <button className="clear-button" onClick={handleClearList}>Clear List</button>
      </div>
    </div>
  );
};

export default SmartShoppingList;
