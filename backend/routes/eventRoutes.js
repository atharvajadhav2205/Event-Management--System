const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/eventController');

// --- Student ---
router.get('/', protect, getApprovedEvents);
router.post('/apply/:id', protect, authorize('student'), applyToEvent);
router.get('/applied', protect, authorize('student'), getAppliedEvents);

// --- Organiser ---
router.post('/create', protect, authorize('organiser'), createEvent);
router.get('/my-events', protect, authorize('organiser'), getMyEvents);

// --- Admin ---
router.get('/pending', protect, authorize('admin'), getPendingEvents);
router.get('/all', protect, authorize('admin'), getAllEvents);
router.put('/:id/approve', protect, authorize('admin'), approveEvent);
router.put('/:id/reject', protect, authorize('admin'), rejectEvent);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
