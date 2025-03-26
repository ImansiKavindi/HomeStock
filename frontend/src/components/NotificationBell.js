import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaBell, FaCircle, FaMoneyBillWave, FaExclamationTriangle, FaCalendarTimes, FaCheckCircle } from 'react-icons/fa';
import '../css/NotificationBell.css';

const API_URL = 'http://localhost:8090/api/notifications';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API_URL);
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/unread-count`);
      const newCount = res.data.unreadCount;
      
      // If unread count increased, trigger bell animation
      if (newCount > unreadCount) {
        setIsRinging(true);
        setTimeout(() => setIsRinging(false), 1000);
      }
      
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/mark-all-read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle click on notification
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    // Additional logic for handling notification click (e.g., navigation)
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for updates
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day ago`;
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return <FaMoneyBillWave className="notification-icon" />;
      case 'low_stock':
        return <FaExclamationTriangle className="notification-icon" />;
      case 'expired_product':
        return <FaCalendarTimes className="notification-icon" />;
      default:
        return <FaCircle className="notification-icon" />;
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className={`notification-bell ${isRinging ? 'ring' : ''}`} 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4 className="notification-title">Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="no-notifications">No notifications</div>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 