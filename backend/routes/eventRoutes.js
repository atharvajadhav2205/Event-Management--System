const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
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
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

// --- Student ---
router.get('/', protect, getApprovedEvents);
router.post('/apply/:id', protect, authorize('student'), applyToEvent);
router.get('/applied', protect, authorize('student'), getAppliedEvents);

// --- Organiser ---
<<<<<<< HEAD
router.post('/create', protect, authorize('organiser'), upload.array('attachments', 10), createEvent);
=======
router.post('/create', protect, authorize('organiser'), upload.single('certificateTemplate'), createEvent);
>>>>>>> 89d7a5cd3a06aaa2d82a142694d0465b728c050b
router.get('/my-events', protect, authorize('organiser'), getMyEvents);

// --- Admin ---
router.get('/pending', protect, authorize('admin'), getPendingEvents);
router.get('/all', protect, authorize('admin'), getAllEvents);
router.put('/:id/approve', protect, authorize('admin'), approveEvent);
router.put('/:id/reject', protect, authorize('admin'), rejectEvent);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// --- Update & Delete (organiser or admin) ---
router.put('/:id', protect, authorize('organiser', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organiser', 'admin'), deleteEvent);

module.exports = router;

