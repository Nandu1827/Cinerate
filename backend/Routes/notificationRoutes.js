const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const { isAdmin } = require('../middleware/authMiddleware');

// Public route for contact form submission
router.post('/contact', notificationController.createNotification);

// Admin routes
router.get('/admin/notifications', isAdmin, notificationController.getNotifications);
router.put('/admin/notifications/:id/read', isAdmin, notificationController.markAsRead);
router.delete('/admin/notifications/:id', isAdmin, notificationController.deleteNotification);

module.exports = router; 