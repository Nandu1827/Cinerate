const mongoose = require('mongoose');
const Notification = require('../models/Notification');
 
exports.createNotification = async (req, res) => {
  try {
    console.log('Received contact form submission:', req.body);
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      console.error('Missing required fields:', { name, email, message });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const notification = new Notification({
      name,
      email,
      message,
      type: 'contact'
    });

    console.log('Creating notification:', notification);
    const savedNotification = await notification.save();
    console.log('Notification created successfully:', savedNotification);
    
    res.status(201).json({ message: 'Message sent successfully', notification: savedNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

 
exports.getNotifications = async (req, res) => {
  try {
    console.log('Fetching notifications for admin:', req.user.email);
 
    console.log('Query parameters:', req.query);
    
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .lean();  
    
    console.log('Found notifications:', notifications.length);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

 
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Marking notification as read:', id);
    
    if (!id) {
      console.error('No notification ID provided');
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      console.log('Notification not found:', id);
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log('Notification marked as read:', notification);
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted', id });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};
