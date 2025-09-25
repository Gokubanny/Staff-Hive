import Notification from '../models/Notification.js';

// GET all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

// POST a new notification
export const createNotification = async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    await newNotification.save();
    res.status(201).json({ success: true, data: newNotification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating notification' });
  }
};
