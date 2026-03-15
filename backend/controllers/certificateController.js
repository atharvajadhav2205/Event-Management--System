const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
          certificateUrl: '', // Will be generated on download
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

/**
 * @desc    Download a certificate as a PDF with template image + student's name
 * @route   GET /api/certificates/download/:certificateId
 * @access  Student (owner only)
 */
const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.certificateId)
      .populate('eventId', 'title date category organiserName certificateTemplate')
      .populate('userId', 'name email');

    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Ensure the student can only download their own certificate
    if (cert.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }

    const studentName = cert.userId.name;
    const eventTitle = cert.eventId?.title || 'Event';
    const eventDate = cert.eventId?.date || '';
    const eventCategory = cert.eventId?.category || '';
    const organiserName = cert.eventId?.organiserName || 'Event Organiser';
    const templatePath = cert.eventId?.certificateTemplate || '';
    const issuedDate = new Date(cert.issuedAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create PDF in landscape orientation
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    // Set response headers
    const filename = `Certificate_${studentName.replace(/\s+/g, '_')}_${eventTitle.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // ── If template image exists, embed it as background ──
    if (templatePath && fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, {
        width: pageWidth,
        height: pageHeight,
      });

      // Overlay student name on the template
      // Position the name roughly in the center of the certificate
      doc.fontSize(36).fillColor('#1a365d').font('Helvetica-Bold')
        .text(studentName, 0, pageHeight * 0.42, {
          align: 'center',
          width: pageWidth,
        });

    } else {
      // ── No template — generate a styled certificate from scratch ──
      const margins = { top: 40, bottom: 40, left: 50, right: 50 };

      // ── Outer border ──
      doc.lineWidth(3)
        .rect(20, 20, pageWidth - 40, pageHeight - 40)
        .stroke('#1a365d');

      // ── Inner border ──
      doc.lineWidth(1)
        .rect(30, 30, pageWidth - 60, pageHeight - 60)
        .stroke('#2b6cb0');

      // ── Decorative top line ──
      const centerX = pageWidth / 2;
      doc.moveTo(centerX - 120, 70).lineTo(centerX + 120, 70).lineWidth(2).stroke('#d69e2e');

      // ── Title ──
      doc.fontSize(14).fillColor('#2b6cb0').font('Helvetica')
        .text('CERTIFICATE', 0, 85, { align: 'center', width: pageWidth });

      doc.fontSize(32).fillColor('#1a365d').font('Helvetica-Bold')
        .text('OF PARTICIPATION', 0, 105, { align: 'center', width: pageWidth });

      // ── Decorative line under title ──
      doc.moveTo(centerX - 120, 150).lineTo(centerX + 120, 150).lineWidth(2).stroke('#d69e2e');

      // ── Body text ──
      doc.fontSize(14).fillColor('#4a5568').font('Helvetica')
        .text('This is to certify that', 0, 175, { align: 'center', width: pageWidth });

      // ── Student Name ──
      doc.fontSize(30).fillColor('#2b6cb0').font('Helvetica-BoldOblique')
        .text(studentName, 0, 205, { align: 'center', width: pageWidth });

      // ── Underline for name ──
      const nameWidth = doc.widthOfString(studentName);
      const nameX = (pageWidth - nameWidth) / 2;
      doc.moveTo(nameX, 242).lineTo(nameX + nameWidth, 242).lineWidth(1).stroke('#2b6cb0');

      // ── Participation line ──
      doc.fontSize(14).fillColor('#4a5568').font('Helvetica')
        .text('has successfully participated in', 0, 260, { align: 'center', width: pageWidth });

      // ── Event Title ──
      doc.fontSize(22).fillColor('#1a365d').font('Helvetica-Bold')
        .text(`"${eventTitle}"`, 0, 290, { align: 'center', width: pageWidth });

      // ── Event details ──
      let detailLine = '';
      if (eventCategory) detailLine += `Category: ${eventCategory}`;
      if (eventDate) detailLine += `${detailLine ? '  |  ' : ''}Date: ${eventDate}`;

      if (detailLine) {
        doc.fontSize(12).fillColor('#718096').font('Helvetica')
          .text(detailLine, 0, 325, { align: 'center', width: pageWidth });
      }

      // ── Decorative bottom line ──
      doc.moveTo(centerX - 180, 365).lineTo(centerX + 180, 365).lineWidth(1).stroke('#e2e8f0');

      // ── Issued date ──
      doc.fontSize(11).fillColor('#718096').font('Helvetica')
        .text(`Issued on: ${issuedDate}`, 0, 380, { align: 'center', width: pageWidth });

      // ── Signature areas ──
      const sigY = 430;

      // Left signature — Organiser
      doc.moveTo(120, sigY).lineTo(300, sigY).lineWidth(1).stroke('#a0aec0');
      doc.fontSize(11).fillColor('#4a5568').font('Helvetica')
        .text(organiserName, 120, sigY + 8, { width: 180, align: 'center' });
      doc.fontSize(9).fillColor('#a0aec0')
        .text('Event Organiser', 120, sigY + 24, { width: 180, align: 'center' });

      // Right signature — EventHub
      doc.moveTo(pageWidth - 300, sigY).lineTo(pageWidth - 120, sigY).lineWidth(1).stroke('#a0aec0');
      doc.fontSize(11).fillColor('#4a5568').font('Helvetica')
        .text('EventHub', pageWidth - 300, sigY + 8, { width: 180, align: 'center' });
      doc.fontSize(9).fillColor('#a0aec0')
        .text('Platform', pageWidth - 300, sigY + 24, { width: 180, align: 'center' });

      // ── Footer ──
      doc.fontSize(8).fillColor('#cbd5e0').font('Helvetica')
        .text(`Certificate ID: ${cert._id}`, 0, pageHeight - 55, { align: 'center', width: pageWidth });
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateCertificate, getMyCertificates, downloadCertificate };
