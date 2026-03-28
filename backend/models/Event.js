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
<<<<<<< HEAD
  registeredStudents: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      participantName: {
        type: String,
        default: '',
      },
      teamName: {
        type: String,
        default: '',
      },
      teamMembers: [
        {
          name: String,
          email: String,
          phone: String,
          college: String,
          yearDept: String,
        }
      ],
      registeredAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  isTeamEvent: {
    type: Boolean,
    default: false,
  },
  minTeamSize: {
    type: Number,
  },
  maxTeamSize: {
    type: Number,
  },
  attachments: [
    {
      name: String,
      url: String,
      type: { type: String },
    }
  ],
=======
  certificateTemplate: {
    type: String,
    default: '',
  },
>>>>>>> 89d7a5cd3a06aaa2d82a142694d0465b728c050b
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
