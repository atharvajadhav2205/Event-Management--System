const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

/**
 * @desc    Create a new event (status defaults to 'pending')
 * @route   POST /api/events/create
 * @access  Organiser
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, collegeName, capacity, category } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      collegeName,
      capacity,
      category,
      organiserId: req.user._id,
      organiserName: req.user.name,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all approved events (for students to browse)
 * @route   GET /api/events
 * @access  Protected
 */
const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .populate('organiserId', 'name email')
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all events created by the logged-in organiser
 * @route   GET /api/events/my-events
 * @access  Organiser
 */
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organiserId: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all pending events for admin review
 * @route   GET /api/events/pending
 * @access  Admin
 */
const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('organiserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all events (for admin - resolved view)
 * @route   GET /api/events/all
 * @access  Admin
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organiserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve an event
 * @route   PUT /api/events/:id/approve
 * @access  Admin
 */
const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject an event
 * @route   PUT /api/events/:id/reject
 * @access  Admin
 */
const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Student applies / registers for an event
 * @route   POST /api/events/apply/:id
 * @access  Student
 */
const applyToEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if already applied
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already applied to this event' });
    }

    // Check capacity
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    event.attendees.push(req.user._id);
    await event.save();

    res.json({ message: 'Successfully applied to event', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get events the student has applied to
 * @route   GET /api/events/applied
 * @access  Student
 */
const getAppliedEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user._id })
      .populate('organiserId', 'name email')
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get analytics data for admin dashboard
 * @route   GET /api/events/analytics
 * @access  Admin
 */
const getAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Event.aggregate([
      { $project: { count: { $size: '$attendees' } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);
    const pendingApprovals = await Event.countDocuments({ status: 'pending' });
    const activeOrganisers = await User.countDocuments({ role: 'organiser' });
    const certificatesIssued = await Certificate.countDocuments();

    // Attendance rate
    const totalAttendance = await Attendance.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: 'present' });
    const avgAttendance = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Monthly events (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyEvents = await Event.aggregate([
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // "YYYY-MM"
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.json({
      totalEvents,
      totalRegistrations: totalRegistrations[0]?.total || 0,
      avgAttendance,
      pendingApprovals,
      activeOrganisers,
      certificatesIssued,
      monthlyEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getApprovedEvents,
  getMyEvents,
  getPendingEvents,
  getAllEvents,
  approveEvent,
  rejectEvent,
  applyToEvent,
  getAppliedEvents,
  getAnalytics,
};
