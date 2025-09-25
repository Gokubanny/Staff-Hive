import express from 'express';
import { getNotifications, createNotification } from '../controllers/notificationsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.post('/', auth, createNotification);

export default router;
