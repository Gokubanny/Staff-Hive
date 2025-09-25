import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  type: { type: String, enum: ['interview', 'meeting', 'training'], default: 'meeting' },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
