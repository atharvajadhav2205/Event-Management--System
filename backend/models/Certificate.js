const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    default: '',
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
});

// One certificate per user per event per student name
certificateSchema.index({ eventId: 1, userId: 1, studentName: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
