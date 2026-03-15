const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  date: {
    type: String,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location/venue is required'],
  },
  collegeName: {
    type: String,
  },
  capacity: {
    type: Number,
    default: 0,

  },
  category: {
    type: String,
    default: 'General',
  },
  organiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organiserName: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  certificateTemplate: {
    type: String,
    default: '',
  },
  posterUrl: {
    type: String,
    default: '',
  },
  prizePool: {
    type: String,
    default: '',
  },
  deadlines: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', eventSchema);
