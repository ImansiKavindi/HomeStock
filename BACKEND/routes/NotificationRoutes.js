const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationControllers");

// Notification routes
router.get("/", NotificationController.getNotifications);
router.get("/unread-count", NotificationController.getUnreadCount);
router.put("/:id/read", NotificationController.markAsRead);
router.put("/mark-all-read", NotificationController.markAllAsRead);

module.exports = router; 