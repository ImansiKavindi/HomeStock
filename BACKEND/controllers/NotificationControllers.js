const NotificationModel = require("../models/NotificationModel");

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationModel.countDocuments({ read: false });
    
    res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await NotificationModel.updateMany({ read: false }, { read: true });
    
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 