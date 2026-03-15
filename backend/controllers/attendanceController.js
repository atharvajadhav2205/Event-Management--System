const Attendance = require('../models/Attendance');
const Event = require('../models/Event');

/**
 * @desc    Get attendees for a specific event (with attendance status)
 * @route   GET /api/attendance/:eventId
 * @access  Organiser
 */
const getAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('attendees', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Get existing attendance records for this event
    const attendanceRecords = await Attendance.find({ eventId: req.params.eventId });
    const attendanceMap = {};
    attendanceRecords.forEach((rec) => {
      attendanceMap[rec.userId.toString()] = rec.status;
    });

    // Combine attendees with their attendance status
    const attendeesWithStatus = event.attendees.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      status: attendanceMap[user._id.toString()] || 'absent',
    }));

    res.json(attendeesWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark attendance for multiple users in an event
 * @route   POST /api/attendance/mark
 * @access  Organiser
 * @body    { eventId, records: [{ userId, status }] }
 */
const markAttendance = async (req, res) => {
  try {
    const { eventId, records } = req.body;

    if (!eventId || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'eventId and records array are required' });
    }

    // Upsert each record
    const operations = records.map((rec) => ({
      updateOne: {
        filter: { eventId, userId: rec.userId },
        update: { $set: { status: rec.status, markedAt: new Date() } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAttendees, markAttendance };
