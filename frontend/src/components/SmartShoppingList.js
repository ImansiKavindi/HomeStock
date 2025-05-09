import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from './Sidebar'; // Import Sidebar component
import "../css/shoppingList.css";
import Swal from 'sweetalert2'; // Import SweetAlert2
import { jsPDF } from "jspdf"; // Import jsPDF

const SmartShoppingList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [activeReminders, setActiveReminders] = useState([]); // Active seasonal reminders
  const [expiredItems, setExpiredItems] = useState([]); // Expired items list
  const [nonExpiringItemsWithInterval, setNonExpiringItemsWithInterval] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [frequentItems, setFrequentItems] = useState({}); // Track frequent manual additions
  
  // New states for quantity calculation
  const [itemQuantities, setItemQuantities] = useState({});
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [timePeriod, setTimePeriod] = useState("week");
  const [customDays, setCustomDays] = useState(0); // New state for custom days
  const [showQuantityInputs, setShowQuantityInputs] = useState(false);
  const [isCustomDays, setIsCustomDays] = useState(false); // Flag for custom days option

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:8090/api/shopping-list");
        setItems(response.data.items || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const fetchActiveReminders = async () => {
      try {
        const response = await axios.get("http://localhost:8090/api/seasonal-reminders/active");
        setActiveReminders(response.data || []);
      } catch (error) {
        console.error("Error fetching active reminders:", error);
      }
    };

    const fetchExpiredItems = async () => {
      const response = await fetch("http://localhost:8090/api/shopping-list/expired");
      const data = await response.json();
      if (data.success) {
        setExpiredItems(data.expiredItems);
      } else {
        console.log("Error fetching expired items.");
      }
    };

    const fetchNonExpiringItems = async () => {
      try {
        const response = await axios.get("http://localhost:8090/api/reminders/non-expiring");
        setNonExpiringItemsWithInterval(response.data);  // This should include `reminderInterval`
      } catch (error) {
        console.error("Error fetching non-expiring items:", error);
      }
    };

    // Load frequent items from localStorage
    const loadFrequentItems = () => {
      const storedFrequentItems = localStorage.getItem("frequentManualItems");
      if (storedFrequentItems) {
        setFrequentItems(JSON.parse(storedFrequentItems));
      }
    };

    fetchItems();
    fetchActiveReminders();
    fetchExpiredItems();
    fetchNonExpiringItems();
    loadFrequentItems();
  }, []);

  // Function to track manually added items
  const trackManualAdd = (item) => {
    const updatedFrequentItems = { ...frequentItems };
    updatedFrequentItems[item] = (updatedFrequentItems[item] || 0) + 1;
    setFrequentItems(updatedFrequentItems);
    localStorage.setItem("frequentManualItems", JSON.stringify(updatedFrequentItems));
  };

  // Get most frequently added items (not already in the list)
  const getMostFrequentItems = () => {
    return Object.entries(frequentItems)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency (descending)
      .map(entry => entry[0]) // Get just the item names
      .filter(item => !items.includes(item)) // Filter out items already in the list
      .slice(0, 3); // Get top 3 most frequent items
  };

  const handleReadyToShop = async () => {
    try {
      const seasonalItems = activeReminders.flatMap(reminder => reminder.items);
      const frequentManualItems = getMostFrequentItems();
  
      // Create a set of unique items, ensuring items from the shopping list aren't duplicated
      const uniqueItems = [
        ...new Set([
          ...seasonalItems,
          ...expiredItems.map(item => item.P_name), // Ensure you're using consistent item identifiers
          ...items, // Prevent duplicates from the current list
          ...nonExpiringItemsWithInterval.filter(item => new Date(item.reminderInterval) <= new Date()).map(item => item.item),
          ...frequentManualItems, // Add frequent manually added items
        ])
      ];
  
      // Filter out items already in the current shopping list
      const itemsToAdd = uniqueItems.filter(item => !items.includes(item));
  
      if (itemsToAdd.length > 0) {
        // Make a POST request to add seasonal items to the shopping list
        await axios.post("http://localhost:8090/api/seasonal-reminders/add-seasonal-items", { items: seasonalItems });
  
        // Make a POST request to add expired items to the shopping list
        await axios.post("http://localhost:8090/api/shopping-list/add-expired-items", { items: expiredItems });
  
        // Add frequent manual items to the shopping list
        for (const item of frequentManualItems) {
          if (!items.includes(item)) {
            await axios.post("http://localhost:8090/api/shopping-list/add", { item });
          }
        }
  
        // Make a request to get due reminders and auto-add them to the shopping list
        const response = await axios.get("http://localhost:8090/api/reminders/auto-add");
  
        // Optionally, update the shopping list state here to reflect changes
        setItems(prevList => [...prevList, ...itemsToAdd]);
  
        const nonExpiringResponse = await axios.get("http://localhost:8090/api/reminders/non-expiring?showReminders=true");
        const activeNonExpiringReminders = nonExpiringResponse.data || [];
  
        localStorage.setItem("storedReminders", JSON.stringify([...activeReminders, ...activeNonExpiringReminders]));
        localStorage.setItem("readyToShopClicked", "true");
  
        window.dispatchEvent(new Event("storage"));
      } else {
        console.log("No new items to add to the shopping list.");
      }
    } catch (error) {
      console.error("Error adding seasonal or expired items:", error);
    }
  };
  
  // Speech recognition handlers
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      Swal.fire({
        icon: 'error',
        title: 'Speech Recognition Not Supported',
        text: 'Your browser does not support speech recognition.',
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Visual feedback that we're listening
    setIsListening(true);
    
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      console.log('Speech recognized:', speechResult);
      
      // Extract the item name (remove "add" if present)
      let itemText = speechResult.trim();
      if (itemText.toLowerCase().startsWith('add ')) {
        itemText = itemText.substring(4).trim();
      }
      
      // Remove trailing periods, commas, and other common punctuation
      itemText = itemText.replace(/[.,!?;:]$/, '').trim();
      
      // Set the item in the input field
      setNewItem(itemText);
      
      // Automatically add the item
      addItemToList(itemText);
      
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      Swal.fire({
        icon: 'error',
        title: 'Recognition Error',
        text: `Error: ${event.error}`,
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const addItemToList = async (itemText) => {
    // First clean the input - trim whitespace and remove trailing punctuation
    const cleanedItem = itemText.trim().replace(/[.,!?;:]$/, '');
    
    if (cleanedItem === "") return;
    if (items.includes(cleanedItem)) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'This item is already in the list.',
      });
      return;
    }
    try {
      await axios.post("http://localhost:8090/api/shopping-list/add", { item: cleanedItem });
      setNewItem("");
      setItems([...items, cleanedItem]);
      
      // Track manually added item
      trackManualAdd(cleanedItem);
      
      Swal.fire({
        icon: 'success',
        title: 'Item Added!',
        text: `${cleanedItem} has been added to your shopping list.`,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'There was an issue adding the item.',
      });
    }
  };

  const handleAddItem = () => {
    addItemToList(newItem);
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
      Swal.fire({
        icon: 'success',
        title: 'Item Updated!',
        text: `${editingItem} has been updated to ${editValue.trim()}.`,
      });
    } catch (error) {
      console.error("Error updating item:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'There was an issue updating the item.',
      });
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return Swal.fire({
      icon: 'warning',
      title: 'No Selection!',
      text: 'Please select items to remove.',
    });

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post("http://localhost:8090/api/shopping-list/remove", { itemsToRemove: selectedItems });
          setItems(items.filter((item) => !selectedItems.includes(item)));
          setSelectedItems([]);
          Swal.fire({
            icon: 'success',
            title: 'Items Removed!',
            text: `${selectedItems.join(", ")} have been removed from the shopping list.`,
          });
        } catch (error) {
          console.error("Error removing items:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an issue removing the items.',
          });
        }
      }
    });
  };

  const handleClearList = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to clear the entire shopping list?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete("http://localhost:8090/api/shopping-list/clear");
          setItems([]);
          setSelectedItems([]);
          Swal.fire({
            icon: 'success',
            title: 'List Cleared!',
            text: 'Your shopping list has been cleared.',
          });
        } catch (error) {
          console.error("Error clearing shopping list:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an issue clearing the list.',
          });
        }
      }
    });
  };

  const handleDownloadPDF = async () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();

      // Background Image (if desired)
      const backgroundUrl = '../images/bg.jpeg'; // Replace with the path to your background image
      doc.addImage(backgroundUrl, 'JPEG', 0, 0, 770, 100); // Adjust as needed

      // Logo (if desired)
      const logoUrl = '../images/logo.png'; // Replace with the path to your logo
      doc.addImage(logoUrl, 'PNG', 10, 8, 30, 30); // Adjust as needed

      // Title
      doc.setFontSize(24);
      doc.setTextColor(0, 128, 0); // Green color for the title
      doc.setFont("helvetica", "bold");
      doc.text("Shopping List", 45, 25); // Adjust the position as needed

      // Separator Line
      doc.setDrawColor(0, 0, 0);
      doc.line(10, 40, 200, 40);

      // Table Header Background
      doc.setFillColor(193, 225, 193); // Light green for header
      doc.rect(10, 45, 190, 12, "F"); // Filled rectangle for header background
      doc.setTextColor(0, 0, 0); // Black color for header text

      // Table Header Labels
      doc.setFontSize(12);
      doc.text("Item", 12, 53);
      
      // Add quantity column if quantities are available
      if (Object.keys(itemQuantities).length > 0) {
        doc.text("Quantity", 120, 53);
      }

      // Add a line under the header
      doc.setDrawColor(0, 0, 0);
      doc.line(10, 55, 200, 55);

      // Add items to the PDF
      let yPosition = 60;
      items.forEach((item, index) => {
        const rowHeight = 10;
        const alternateColor = index % 2 === 0 ? [240, 240, 240] : [255, 255, 255]; // Alternate row colors

        // Set alternating row colors
        doc.setFillColor(...alternateColor);
        doc.rect(10, yPosition - 4, 190, rowHeight, "F"); // Row background color

        // Draw text for each item
        doc.setTextColor(0, 0, 0); // Black color for text
        doc.text(item, 12, yPosition); // Adjust position as needed
        
        // Add quantity if available
        if (itemQuantities[item]) {
          doc.text(itemQuantities[item], 120, yPosition);
        }

        // Increase yPosition for the next row
        yPosition += rowHeight;
      });

      // Footer Section: Page number and date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray color for footer
      doc.text("Generated on: " + new Date().toLocaleString(), 10, yPosition + 10); // Date & time
      doc.text("Page " + doc.internal.getNumberOfPages(), 180, yPosition + 10); // Page number

      // Save the PDF
      doc.save("shopping_list.pdf");

      // Show success message after download
      Swal.fire({
        icon: 'success',
        title: 'Download Successful!',
        text: 'Your shopping list PDF has been downloaded.',
      });
    } catch (error) {
      console.error("Error downloading shopping list:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'There was an issue downloading the shopping list.',
      });
    }
  };

  // Check if an item is a frequent manual add
  const isFrequentItem = (item) => {
    return frequentItems[item] && frequentItems[item] >= 2; // Consider frequent if added manually at least twice
  };

  // Check if an item is from non-expiring reminders
  const isNonExpiringItem = (item) => {
    return nonExpiringItemsWithInterval.some(nItem => nItem.item === item);
  };

  // UPDATED FUNCTION: Calculate quantities based on item, number of people, and time period
  const calculateQuantities = () => {
    // Base dictionary for commonly known items (amounts per person per week)
    const baseAmounts = {
      "rice": {amount: 0.5, unit: "kg"},
      "pasta": {amount: 0.4, unit: "kg"},
      "bread": {amount: 1, unit: "loaf"},
      "milk": {amount: 2, unit: "liters"},
      "eggs": {amount: 6, unit: ""},
      "chicken": {amount: 0.5, unit: "kg"},
      "fish": {amount: 0.3, unit: "kg"},
      "potatoes": {amount: 1, unit: "kg"},
      "onions": {amount: 3, unit: ""},
      "tomatoes": {amount: 0.5, unit: "kg"},
      "apples": {amount: 3, unit: ""},
      "bananas": {amount: 5, unit: ""},
      "oranges": {amount: 4, unit: ""},
      "carrots": {amount: 0.5, unit: "kg"},
      "cheese": {amount: 0.2, unit: "kg"},
      "yogurt": {amount: 0.5, unit: "kg"},
      "butter": {amount: 0.1, unit: "kg"},
      "oil": {amount: 0.25, unit: "liter"},
      "sugar": {amount: 0.2, unit: "kg"},
      "flour": {amount: 0.3, unit: "kg"},
      "coffee": {amount: 0.1, unit: "kg"},
      "tea": {amount: 7, unit: "bags"},
      "juice": {amount: 1, unit: "liter"},
      "soda": {amount: 1, unit: "liter"},
      "water": {amount: 3, unit: "liters"},
      "salt": {amount: 0.05, unit: "kg"},
      "pepper": {amount: 0.01, unit: "kg"},
      "paper towels": {amount: 1, unit: "roll"},
      "soap": {amount: 1, unit: "bar"},
      "shampoo": {amount: 0.1, unit: "bottle"},
      "toothpaste": {amount: 0.1, unit: "tube"},
      "Milk Powder": {amount: 0.5, unit: "packet"},
      "dhal": {amount: 0.25, unit: "g"},
      "tuna": {amount: 0.5, unit: "tin"},
      "Lanterns": {amount: 1, unit: ""},
      "Oil Lamps": {amount: 2, unit: ""},
      "Candles": {amount: 2, unit: ""},
      "Vesak Buckets": {amount: 2, unit: ""},
    };

    // Time multipliers
    const timeMultipliers = {
      "day": 1/7,
      "week": 1,
      "two weeks": 2,
      "month": 4.3,
      "custom": customDays / 7, // Use customDays for custom time period
    };

    // Calculate quantities for each item
    const quantities = {};
    items.forEach(item => {
      // Check if item is from non-expiring reminders
      if (isNonExpiringItem(item)) {
        // For non-expiring items, always use "1 unit"
        quantities[item] = "1 unit";
      } else {
        // For regular items, calculate based on people and time period
        const baseInfo = baseAmounts[item.toLowerCase()] || { amount: 0.2, unit: "units" };
        const multiplier = isCustomDays ? timeMultipliers.custom : (timeMultipliers[timePeriod] || 1);
        
        // Calculate quantity with formula: BaseAmount × NumberOfPeople × TimeMultiplier
        const calculatedAmount = (baseInfo.amount * numberOfPeople * multiplier).toFixed(1);
        
        // Format the quantity string
        quantities[item] = calculatedAmount + (baseInfo.unit ? ` ${baseInfo.unit}` : "");
      }
    });

    // Update state with calculated quantities
    setItemQuantities(quantities);
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Quantities Calculated!',
      text: isCustomDays ? 
        `Calculated quantities for ${numberOfPeople} people for ${customDays} days.` :
        `Calculated quantities for ${numberOfPeople} people for ${timePeriod}.`,
    });
  };

  // Toggle quantity inputs visibility
  const toggleQuantityInputs = () => {
    setShowQuantityInputs(!showQuantityInputs);
  };

  // Handle custom days selection
  const handleTimePeriodChange = (e) => {
    const value = e.target.value;
    setTimePeriod(value);
    setIsCustomDays(value === "custom");
  };

  return (
    <div className="shopping-list-container">
      <Sidebar className="sidebar" />
      <div className="shopping-list-wrapper">
        <div className="shopping-list-section">
          <h1>Smart Shopping List</h1>
          <div className="button-container">
            <button className="reminders-btn" onClick={() => navigate("/reminders")}>Reminders</button>
            <button className="ready-to-shop-btn" onClick={handleReadyToShop}>Ready to Shop</button>
            <button className="quantities-btn" onClick={toggleQuantityInputs}>Get Quantities</button>
          </div>

          {/* Quantity Calculation Panel (shown/hidden) */}
          {showQuantityInputs && (
            <div className="quantities-panel">
              <h3>Calculate Recommended Quantities</h3>
              <div className="quantities-form">
                <div className="quantities-input-group">
                  <label htmlFor="numPeople">Number of People: </label>
                  <input
                    id="numPeople"
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                    className="number-input"
                  />
                </div>
                <div className="quantities-input-group">
                  <label htmlFor="timePeriod">Time Period: </label>
                  <select
                    id="timePeriod"
                    value={timePeriod}
                    onChange={handleTimePeriodChange}
                    className="select-input"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="two weeks">Two Weeks</option>
                    <option value="month">Month</option>
                    <option value="custom">Custom Days</option>
                  </select>
                </div>
                
                {/* Custom days input (shown only when "Custom Days" is selected) */}
                {isCustomDays && (
                  <div className="quantities-input-group">
                    <label htmlFor="customDays">Number of Days: </label>
                    <input
                      id="customDays"
                      type="number"
                      min="1"
                      max="365"
                      value={customDays}
                      onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                      className="number-input"
                    />
                  </div>
                )}
                
                <button 
                  onClick={calculateQuantities}
                  className="calculate-btn"
                >
                  Calculate
                </button>
              </div>
            </div>
          )}

          {/* Add Item Section - Modified with mic button */}
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="item-input"
            />
            <button className="Add" onClick={handleAddItem}>Add Item</button>
            <button 
              onClick={handleMicClick} 
              className={`mic-btn ${isListening ? "mic-active" : ""}`}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </div>

          <ul>
            {items.map((item, index) => {
            const expiredItem = expiredItems.find(expired => expired.P_name === item);
            const nonExpiringItem = nonExpiringItemsWithInterval.find(nItem => nItem.item === item);
            const isDueNonExpiringItem = nonExpiringItem && new Date(nonExpiringItem.reminderInterval) <= new Date();
            const isFrequent = isFrequentItem(item);
            
            return (
              <li key={index} className="shopping-list-item">
                {editingItem === item ? (
                  <>
                    <input 
                      type="text" 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)} 
                    />
                    <button className="Save" onClick={handleUpdateItem}>Save</button>
                    <button className="Cancel" onClick={() => setEditingItem(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="item-text">
                      {item}
                      {itemQuantities[item] && (
                        <span className="item-quantity">
                          → {itemQuantities[item]}
                        </span>
                      )}
                      
                      {expiredItem && (
                        <span className="hover-message">
                          Expired on {expiredItem.Expire_Date ? new Date(expiredItem.Expire_Date).toLocaleDateString() : "Unknown Date"}
                        </span>
                      )}

                      {activeReminders.some(reminder => reminder.items.includes(item)) && (
                        <span className="hover-message">
                          {`In ${activeReminders.find(reminder => reminder.items.includes(item)).season} season, you need ${item}`}
                        </span>
                      )}

                      {/* Fixed Display non-expiring reminder message */}
                      {isDueNonExpiringItem && (
                        <span className="hover-message" style={{ backgroundColor: '#004d00' }}>
                          <strong>Auto-Added:</strong> {nonExpiringItem.reminderMessage || `Time to buy ${item} again (Last purchased: ${nonExpiringItem.lastPurchaseDate ? new Date(nonExpiringItem.lastPurchaseDate).toLocaleDateString() : "Unknown"})`}
                        </span>
                      )}

                      {/* Display hover message for frequent items */}
                      {isFrequent && (
                        <span className="hover-message" style={{ backgroundColor: '#023102' }}>
                          Frequently added item (added {frequentItems[item]} times)
                        </span>
                      )}
                    </span>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item)} 
                      onChange={() => handleSelectItem(item)} 
                      className="checkbox" 
                    />
                  </>
                )}
              </li>
            );
          })}
          </ul>

          <div className="button-container">
            <button className="edit-selected-btn" onClick={handleEditItem} disabled={selectedItems.length !== 1}>Edit Selected</button>
            <button className="remove-selected-btn" onClick={handleRemoveSelected} disabled={selectedItems.length === 0}>Remove Selected</button>
            <button className="clear-list-btn" onClick={handleClearList}>Clear List</button>
            <button className="download-pdf-btn" onClick={handleDownloadPDF}>Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartShoppingList;