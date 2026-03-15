const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAttendees, markAttendance } = require('../controllers/attendanceController');

// GET /api/attendance/:eventId — Get attendees for an event
router.get('/:eventId', protect, authorize('organiser'), getAttendees);

// POST /api/attendance/mark — Mark attendance for multiple users
router.post('/mark', protect, authorize('organiser'), markAttendance);

module.exports = router;
