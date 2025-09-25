import express from 'express';
import { getEvents, createEvent } from '../controllers/eventsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getEvents);
router.post('/', auth, createEvent);

export default router;
