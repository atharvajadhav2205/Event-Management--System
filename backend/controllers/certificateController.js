const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const PDFDocumentKit = require('pdfkit');
const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');
const Certificate = require('../models/Certificate');
const CertificateSettings = require('../models/CertificateSettings');
const Attendance = require('../models/Attendance');
<<<<<<< HEAD
const User = require('../models/User');
const Event = require('../models/Event');

// Ensure local temp directories exist (for intermediate processing)
const templatesDir = path.join(__dirname, '../uploads/templates');
const certificatesDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });
if (!fs.existsSync(certificatesDir)) fs.mkdirSync(certificatesDir, { recursive: true });

/* ───────── helpers ───────── */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}
=======
const Event = require('../models/Event');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
>>>>>>> 89d7a5cd3a06aaa2d82a142694d0465b728c050b

/**
 * Upload a local file to Cloudinary and return the result.
 */
async function uploadToCloudinary(filePath, folder, publicId, resourceType = 'image') {
  return cloudinary.uploader.upload(filePath, {
    folder,
    public_id: publicId,
    resource_type: resourceType,
    overwrite: true,
  });
}

/**
 * Create an SVG text overlay and composite it onto an image using sharp.
 */
async function renderTextOnImage(templatePath, studentName, settings, outputPath) {
  const image = sharp(templatePath);
  const metadata = await image.metadata();
  const imgWidth = metadata.width;
  const imgHeight = metadata.height;

  const x = Math.round((settings.namePositionX / 100) * imgWidth);
  const y = Math.round((settings.namePositionY / 100) * imgHeight);
  const fontSize = settings.fontSize || 40;
  const textColor = settings.textColor || '#000000';

  const fontMap = {
    'Helvetica': 'Helvetica, Arial, sans-serif',
    'Arial': 'Arial, Helvetica, sans-serif',
    'Times New Roman': "'Times New Roman', Times, serif",
    'Courier': "'Courier New', Courier, monospace",
  };
  const fontFamily = fontMap[settings.fontFamily] || 'Helvetica, Arial, sans-serif';

  const svgText = `
    <svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${x}"
        y="${y}"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        fill="${textColor}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-weight="bold"
      >${escapeXml(studentName)}</text>
    </svg>
  `;

  await image
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .toFile(outputPath);
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Render student name on a PDF template using pdf-lib.
 */
async function renderTextOnPdf(templatePath, studentName, settings, outputPath) {
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const fontMap = {
    'Helvetica': StandardFonts.HelveticaBold,
    'Arial': StandardFonts.HelveticaBold,
    'Times New Roman': StandardFonts.TimesRomanBold,
    'Courier': StandardFonts.CourierBold,
  };
  const fontKey = fontMap[settings.fontFamily] || StandardFonts.HelveticaBold;
  const font = await pdfDoc.embedFont(fontKey);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const x = (settings.namePositionX / 100) * width;
  const y = height - (settings.namePositionY / 100) * height;
  const fontSize = settings.fontSize || 40;
  const color = hexToRgb(settings.textColor || '#000000');

  const textWidth = font.widthOfTextAtSize(studentName, fontSize);

  firstPage.drawText(studentName, {
    x: x - textWidth / 2,
    y: y - fontSize / 2,
    size: fontSize,
    font,
    color: rgb(color.r, color.g, color.b),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

/**
 * Clean up local temp file (ignore errors).
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (_) {}
}

/* ───────── controllers ───────── */

/**
 * @desc    Upload certificate template for an event → Cloudinary
 * @route   POST /api/certificates/upload-template/:eventId
 * @access  Organiser
 */
const uploadTemplate = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event belongs to organiser
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a template file' });
    }

<<<<<<< HEAD
    const ext = path.extname(req.file.originalname).toLowerCase();
    const templateType = ext.replace('.', '');
    const isPdf = templateType === 'pdf';

    // Also keep a local copy for server-side rendering
    const localFilename = `template-${eventId}${ext}`;
    const localPath = path.join(templatesDir, localFilename);
    try {
      if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });
      fs.copyFileSync(req.file.path, localPath);
    } catch (err) {
      console.warn('copyFileSync failed (possibly due to Windows file lock), attempting fallback...', err);
      fs.writeFileSync(localPath, fs.readFileSync(req.file.path));
    }

    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(
      req.file.path,
      'certificates/templates',
      `template-${eventId}`,
      isPdf ? 'raw' : 'image'
    );

    // Clean up multer temp file
    cleanupFile(req.file.path);

    // Upsert certificate settings with Cloudinary URL
    const settings = await CertificateSettings.findOneAndUpdate(
      { eventId },
      {
        templatePath: `/uploads/templates/${localFilename}`,
        templateCloudinaryUrl: cloudResult.secure_url,
        templateType,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Template uploaded successfully',
      settings,
    });
  } catch (error) {
    console.error('Upload template error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Save/update certificate text settings for an event
 * @route   PUT /api/certificates/settings/:eventId
 * @access  Organiser
 */
const saveSettings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { namePositionX, namePositionY, fontSize, fontFamily, textColor } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    const settings = await CertificateSettings.findOneAndUpdate(
      { eventId },
      {
        ...(namePositionX !== undefined && { namePositionX }),
        ...(namePositionY !== undefined && { namePositionY }),
        ...(fontSize !== undefined && { fontSize }),
        ...(fontFamily !== undefined && { fontFamily }),
        ...(textColor !== undefined && { textColor }),
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Settings saved', settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get certificate settings for an event
 * @route   GET /api/certificates/settings/:eventId
 * @access  Organiser
 */
const getSettings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const settings = await CertificateSettings.findOne({ eventId });
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Generate certificate records for attendees (No file generation yet)
 * @route   POST /api/certificates/generate/:eventId
 * @access  Organiser
 */
const generateCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    const attendanceRecords = await Attendance.find({ eventId, status: 'present' })
      .populate('userId', 'name email');

    if (attendanceRecords.length === 0) {
      return res.status(400).json({ message: 'No present attendees found. Mark attendance first.' });
    }

    // Try dropping the old restrictive index so team members can get certificates under the same userId
    try {
      await Certificate.collection.dropIndex('eventId_1_userId_1');
    } catch (e) {
      // index may not exist, which is fine
    }

    const generated = [];

    for (const record of attendanceRecords) {
      const user = record.userId;
      if (!user) continue;

      let reg = null;
      if (event.registeredStudents) {
        reg = event.registeredStudents.find(r => r.userId.toString() === user._id.toString());
      }

      if (event.isTeamEvent && reg && reg.teamMembers && reg.teamMembers.length > 0) {
        // Generate for EVERY member
        for (const member of reg.teamMembers) {
          if (!member.name) continue;
          
          const cert = await Certificate.findOneAndUpdate(
            { eventId, userId: user._id, studentName: member.name },
            {
              studentName: member.name,
              issuedAt: new Date(),
            },
            { upsert: true, new: true }
          );
          generated.push(cert);
        }
      } else {
        // Individual Event
        let studentNameToUse = user.name;
        if (reg && reg.participantName) {
          studentNameToUse = reg.participantName;
        }
        
        const cert = await Certificate.findOneAndUpdate(
          { eventId, userId: user._id, studentName: studentNameToUse },
          {
            studentName: studentNameToUse,
            issuedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        generated.push(cert);
=======
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
>>>>>>> 89d7a5cd3a06aaa2d82a142694d0465b728c050b
      }
    }

    res.status(201).json({
      message: `${generated.length} certificate(s) generated successfully`,
      certificates: generated,
    });
  } catch (error) {
    console.error('Generate certificates error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all generated certificates for an event
 * @route   GET /api/certificates/event/:eventId
 * @access  Organiser
 */
const getEventCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;
    const certificates = await Certificate.find({ eventId })
      .populate('userId', 'name email')
      .sort({ issuedAt: -1 });
    res.json(certificates);
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
<<<<<<< HEAD
 * @desc    Preview certificate with sample name using current settings
 * @route   POST /api/certificates/preview/:eventId
 * @access  Organiser
 */
const previewCertificate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { sampleName } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    const settings = await CertificateSettings.findOne({ eventId });
    if (!settings || !settings.templatePath) {
      return res.status(400).json({ message: 'Please upload a certificate template first' });
    }

    const previewSettings = {
      namePositionX: req.body.namePositionX ?? settings.namePositionX,
      namePositionY: req.body.namePositionY ?? settings.namePositionY,
      fontSize: req.body.fontSize ?? settings.fontSize,
      fontFamily: req.body.fontFamily ?? settings.fontFamily,
      textColor: req.body.textColor ?? settings.textColor,
    };

    const templateAbsPath = path.join(__dirname, '..', settings.templatePath);
    const isPdf = settings.templateType === 'pdf';
    const previewName = sampleName || 'John Doe';

    if (isPdf) {
      // For PDF, render to PDF then convert to PNG preview using sharp
      const tempPdfPath = path.join(certificatesDir, `preview-${eventId}.pdf`);
      await renderTextOnPdf(templateAbsPath, previewName, previewSettings, tempPdfPath);
      // Keep PDF locally — served via Express static
      res.json({ previewUrl: `/uploads/certificates/preview-${eventId}.pdf`, isPdf: true });
    } else {
      const previewPath = path.join(certificatesDir, `preview-${eventId}.png`);
      await renderTextOnImage(templateAbsPath, previewName, previewSettings, previewPath);
      // Keep preview locally — served via Express static
      res.json({ previewUrl: `/uploads/certificates/preview-${eventId}.png`, isPdf: false });
    }
  } catch (error) {
    console.error('Preview certificate error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Download a certificate (generates PDF on-the-fly)
 * @route   GET /api/certificates/download/:certificateId
 * @access  Authenticated
 */
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findById(certificateId)
      .populate('eventId', 'title date category organiserId')
=======
 * @desc    Download a certificate as a PDF with template image + student's name
 * @route   GET /api/certificates/download/:certificateId
 * @access  Student (owner only)
 */
const downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.certificateId)
      .populate('eventId', 'title date category organiserName certificateTemplate')
>>>>>>> 89d7a5cd3a06aaa2d82a142694d0465b728c050b
      .populate('userId', 'name email');

    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

<<<<<<< HEAD
    const event = cert.eventId;
    const studentName = cert.studentName || cert.userId.name;
    const settings = await CertificateSettings.findOne({ eventId: event._id });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${studentName.replace(/\s+/g, '_')}.pdf"`);

    // MODE A: Using an uploaded template image/pdf
    if (settings && settings.templatePath) {
      const templateAbsPath = path.join(__dirname, '..', settings.templatePath);
      const isPdf = settings.templateType === 'pdf';
      
      if (fs.existsSync(templateAbsPath)) {
        if (isPdf) {
          // Stamp name on PDF and pipe
          const templateBytes = fs.readFileSync(templateAbsPath);
          const pdfDoc = await PDFDocument.load(templateBytes);

          const fontMap = {
            'Helvetica': StandardFonts.HelveticaBold,
            'Arial': StandardFonts.HelveticaBold,
            'Times New Roman': StandardFonts.TimesRomanBold,
            'Courier': StandardFonts.CourierBold,
          };
          const fontKey = fontMap[settings.fontFamily] || StandardFonts.HelveticaBold;
          const font = await pdfDoc.embedFont(fontKey);

          const pages = pdfDoc.getPages();
          const firstPage = pages[0];
          const { width, height } = firstPage.getSize();

          const x = (settings.namePositionX / 100) * width;
          const y = height - (settings.namePositionY / 100) * height;
          const fontSize = settings.fontSize || 40;
          const color = hexToRgb(settings.textColor || '#000000');

          const textWidth = font.widthOfTextAtSize(studentName, fontSize);
          firstPage.drawText(studentName, {
            x: x - textWidth / 2,
            y: y - fontSize / 2,
            size: fontSize,
            font,
            color: rgb(color.r, color.g, color.b),
          });

          const pdfBytes = await pdfDoc.save();
          return res.send(Buffer.from(pdfBytes));
        } else {
          // Stamp name on Image, then wrap in PDF
          const tempImgPath = path.join(certificatesDir, `temp-${Date.now()}.png`);
          await renderTextOnImage(templateAbsPath, studentName, settings, tempImgPath);
          
          const doc = new PDFDocumentKit({ size: 'A4', layout: 'landscape' });
          doc.pipe(res);
          doc.image(tempImgPath, 0, 0, { width: 841.89, height: 595.28 });
          doc.end();
          
          cleanupFile(tempImgPath);
          return;
        }
      }
    }

    // MODE B: No template available, draw certificate from scratch using pdfkit
    const doc = new PDFDocumentKit({ size: 'A4', layout: 'landscape', margin: 50 });
    doc.pipe(res);

    // Outer border
    doc.rect(20, 20, 801.89, 555.28).lineWidth(4).stroke('#0f172a'); // Navy
    // Inner border
    doc.rect(30, 30, 781.89, 535.28).lineWidth(1).stroke('#3b82f6'); // Blue
    // Corner accents
    doc.moveTo(25, 50).lineTo(45, 50).stroke('#d97706'); // Goldish
    doc.moveTo(50, 25).lineTo(50, 45).stroke('#d97706');

    doc.moveDown(2);
    doc.font('Times-BoldItalic').fontSize(40).fillColor('#0f172a').text('CERTIFICATE OF PARTICIPATION', { align: 'center' });
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(16).fillColor('#64748b').text('This is to certify that', { align: 'center' });
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(36).fillColor('#1e40af').text(studentName, { align: 'center' });
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(16).fillColor('#64748b').text('has successfully participated in', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f172a').text(event.title, { align: 'center' });
    
    doc.moveDown(0.5);
    const dateStr = new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.font('Helvetica').fontSize(14).fillColor('#64748b').text(`Category: ${event.category}  |  Date: ${dateStr}`, { align: 'center' });

    doc.moveDown(3);
    const orgName = 'Organiser'; // We could populate organiser name here if we had it
    
    // Signatures
    const yPos = 450;
    doc.fontSize(12).fillColor('#000000');
    doc.text('_______________________', 150, yPos);
    doc.text(orgName, 170, yPos + 20);
    
    doc.text('_______________________', 550, yPos);
    doc.text('EventHub Director', 570, yPos + 20);

    // Footer ID
    doc.fontSize(8).fillColor('#94a3b8').text(`Certificate ID: ${cert._id}`, 50, 540);

    doc.end();

  } catch (error) {
    console.error('Download certificate error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

/**
 * @desc    Get all certificates issued by assigned organisers
 * @route   GET /api/certificates/admin/all
 * @access  Admin
 */
const getAllCertificates = async (req, res) => {
  try {
    const myOrganisers = await User.find({ role: 'organiser', adminId: req.user._id }).select('_id');
    const orgIds = myOrganisers.map(org => org._id);
    
    // Find events created by these organisers
    const adminEvents = await Event.find({ organiserId: { $in: orgIds } }).select('_id title');
    const adminEventIds = adminEvents.map(e => e._id);

    const certificates = await Certificate.find({ eventId: { $in: adminEventIds } })
      .populate('userId', 'name email phone college yearDept')
      .populate('eventId', 'title category date')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
=======
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
>>>>>>> 89d7a5cd3a06aaa2d82a142694d0465b728c050b
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD
module.exports = {
  uploadTemplate,
  saveSettings,
  getSettings,
  generateCertificates,
  getEventCertificates,
  getMyCertificates,
  previewCertificate,
  downloadCertificate,
  getAllCertificates,
};
=======
module.exports = { generateCertificate, getMyCertificates, downloadCertificate };
>>>>>>> 89d7a5cd3a06aaa2d82a142694d0465b728c050b
