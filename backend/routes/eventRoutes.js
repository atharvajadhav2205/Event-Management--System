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
  getPublicEvents,
  getAnalytics,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

// --- Public ---
router.get('/public', getPublicEvents);

// --- Student ---
router.get('/', protect, getApprovedEvents);
router.post('/apply/:id', protect, authorize('student'), applyToEvent);
router.get('/applied', protect, authorize('student'), getAppliedEvents);

// --- Organiser ---
// Resolved Conflict: Combined both 'attachments' and 'certificateTemplate' uploads
router.post(
  '/create',
  protect,
  authorize('organiser'),
  upload.fields([
    { name: 'attachments', maxCount: 10 },
    { name: 'certificateTemplate', maxCount: 1 }
  ]),
  createEvent
);
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