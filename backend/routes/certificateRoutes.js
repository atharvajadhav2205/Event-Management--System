const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { generateCertificate, getMyCertificates } = require('../controllers/certificateController');

// POST /api/certificates/generate — Generate certificates for attendees
router.post('/generate', protect, authorize('organiser'), generateCertificate);

// GET /api/certificates/my — Get student's certificates
router.get('/my', protect, authorize('student'), getMyCertificates);

module.exports = router;
