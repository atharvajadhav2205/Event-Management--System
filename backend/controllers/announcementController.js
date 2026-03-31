const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const mongoose = require('mongoose');

// POST /api/announcements/:eventId
const postAnnouncement = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }

    const event = await Event.findById(eventId).populate('attendees', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Verify organiser owns event
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to post announcements for this event' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      eventId,
      organiserId: req.user._id
    });

    // Send email blast
    const subject = `New Announcement: ${event.title} - ${title}`;
    const emailPromises = event.attendees.map(attendee => {
      if (attendee.email) {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #374151;">
            <h2 style="color: #4f46e5;">📢 New Announcement for ${event.title}</h2>
            <p>Hi ${attendee.name},</p>
            <p>The organiser has just posted a new update:</p>
            <div style="background-color: #f9fafb; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #111827;">${title}</h3>
              <p style="white-space: pre-wrap; margin-bottom: 0;">${message}</p>
            </div>
            <p>Please log in to your dashboard to view more details.</p>
            <p>Best regards,<br/>The EventHub Team</p>
          </div>
        `;
        return sendEmail(attendee.email, subject, htmlContent);
      }
      return Promise.resolve();
    });

    await Promise.allSettled(emailPromises);

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/announcements/student
const getStudentAnnouncements = async (req, res) => {
  try {
    // 1. Find all events the student is applied to
    const events = await Event.find({ attendees: req.user._id }).select('_id title');
    const eventIds = events.map(e => e._id);

    // 2. Fetch announcements for these events
    const announcements = await Announcement.find({ eventId: { $in: eventIds } })
      .populate('eventId', 'title')
      .populate('organiserId', 'name')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/announcements/event/:eventId
const getEventAnnouncements = async (req, res) => {
  try {
    const { eventId } = req.params;
    const announcements = await Announcement.find({ eventId })
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  postAnnouncement,
  getStudentAnnouncements,
  getEventAnnouncements
};
