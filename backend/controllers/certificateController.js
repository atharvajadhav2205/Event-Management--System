const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');

/**
 * @desc    Generate certificate(s) for attendees who were present
 * @route   POST /api/certificates/generate
 * @access  Organiser
 * @body    { eventId, userIds: [userId1, userId2, ...] }
 */
const generateCertificate = async (req, res) => {
  try {
    const { eventId, userIds } = req.body;

    if (!eventId || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'eventId and userIds array are required' });
    }

    const certificates = [];

    for (const userId of userIds) {
      // Check if certificate already exists
      const existing = await Certificate.findOne({ eventId, userId });
      if (!existing) {
        const cert = await Certificate.create({
          eventId,
          userId,
          certificateUrl: `/certificates/${eventId}_${userId}.pdf`,
        });
        certificates.push(cert);
      }
    }

    res.status(201).json({
      message: `${certificates.length} certificate(s) generated`,
      certificates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get certificates for the logged-in student
 * @route   GET /api/certificates/my
 * @access  Student
 */
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id })
      .populate('eventId', 'title date category')
      .sort({ issuedAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateCertificate, getMyCertificates };
