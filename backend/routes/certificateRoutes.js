const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadTemplate,
  saveSettings,
  getSettings,
  generateCertificates,
  getEventCertificates,
  getMyCertificates,
  previewCertificate,
  downloadCertificate,
  getAllCertificates,
} = require('../controllers/certificateController');

// GET /api/certificates/admin/all - Get all certificates for admin
router.get('/admin/all', protect, authorize('admin'), getAllCertificates);

// POST /api/certificates/upload-template/:eventId — Upload certificate template
router.post(
  '/upload-template/:eventId',
  protect,
  authorize('organiser'),
  upload.single('template'),
  uploadTemplate
);

// PUT /api/certificates/settings/:eventId — Save text placement settings
router.put('/settings/:eventId', protect, authorize('organiser'), saveSettings);

// GET /api/certificates/settings/:eventId — Get settings for an event
router.get('/settings/:eventId', protect, authorize('organiser'), getSettings);

// POST /api/certificates/generate/:eventId — Generate certificates for all present attendees
router.post('/generate/:eventId', protect, authorize('organiser'), generateCertificates);

// POST /api/certificates/preview/:eventId — Preview certificate with sample name
router.post('/preview/:eventId', protect, authorize('organiser'), previewCertificate);

// GET /api/certificates/event/:eventId — Get generated certificates for an event
router.get('/event/:eventId', protect, authorize('organiser'), getEventCertificates);

// GET /api/certificates/my — Get student's certificates
router.get('/my', protect, authorize('student'), getMyCertificates);

// GET /api/certificates/download/:certificateId — Download certificate PDF
router.get('/download/:certificateId', protect, downloadCertificate);

module.exports = router;