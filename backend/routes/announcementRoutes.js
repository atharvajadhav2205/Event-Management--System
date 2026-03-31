const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { postAnnouncement, getStudentAnnouncements, getEventAnnouncements } = require('../controllers/announcementController');

// Protect all announcement routes
router.use(protect);

// Student fetching their notifications
router.get('/student', authorize('student'), getStudentAnnouncements);

// Organiser routes for specific events
router.post('/:eventId', authorize('organiser', 'admin'), postAnnouncement);
router.get('/event/:eventId', authorize('organiser', 'admin'), getEventAnnouncements);

module.exports = router;
