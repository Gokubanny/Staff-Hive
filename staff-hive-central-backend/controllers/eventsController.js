import Event from '../models/Event.js';

// GET all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching events' });
  }
};

// POST a new event
export const createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating event' });
  }
};
