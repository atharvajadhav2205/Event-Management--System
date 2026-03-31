const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
/**
 * @desc    Create a new event (status defaults to 'pending')
 * @route   POST /api/events/create
 * @access  Organiser
 */
const mongoose = require('mongoose');

const createEvent = async (req, res) => {
  try {
    // Note: attachments are in req.files from Multer
    const { 
      title, description, date, time, location, collegeName, 
      capacity, category, isTeamEvent, minTeamSize, maxTeamSize, posterUrl, prizePool, deadlines
    } = req.body;

    const parsedAttachments = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const f = req.files[i];
        parsedAttachments.push({
          name: f.originalname,
          url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
          type: f.originalname.split('.').pop().toUpperCase(),
        });
      }
    }

    const eventData = {
      title,
      description,
      date,
      time,
      location,
      collegeName,
      capacity: capacity ? Number(capacity) : 0,
      category,
      posterUrl,
      prizePool,
      deadlines,
      isTeamEvent: isTeamEvent === 'true' || isTeamEvent === true,
      minTeamSize: minTeamSize ? Number(minTeamSize) : 0,
      maxTeamSize: maxTeamSize ? Number(maxTeamSize) : 0,
      attachments: parsedAttachments,
      organiserId: req.user._id,
      organiserName: req.user.name,
    };

    // If a certificate template image was uploaded via multer
    if (req.file) {
      eventData.certificateTemplate = req.file.path;
    }

    const event = await Event.create(eventData);

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all approved events (for students to browse)
 * @route   GET /api/events
 * @access  Protected
 */
const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .populate('organiserId', 'name email')
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get public events (unprotected, for landing page slider)
 * @route   GET /api/events/public
 * @access  Public
 */
const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .populate('organiserId', 'name collegeName') // Avoid exposing emails or sensitive data
      .sort({ date: -1 })
      .limit(10); // Limit to top 10 for slider
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all events created by the logged-in organiser
 * @route   GET /api/events/my-events
 * @access  Organiser
 */
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organiserId: req.user._id })
      .populate('registeredStudents.userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all pending events for admin review
 * @route   GET /api/events/pending
 * @access  Admin
 */
const getPendingEvents = async (req, res) => {
  try {
    const myOrganisers = await User.find({ role: 'organiser', adminId: req.user._id }).select('_id');
    const orgIds = myOrganisers.map(org => org._id);

    const events = await Event.find({ status: 'pending', organiserId: { $in: orgIds } })
      .populate('organiserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all events (for admin - resolved view)
 * @route   GET /api/events/all
 * @access  Admin
 */
const getAllEvents = async (req, res) => {
  try {
    const myOrganisers = await User.find({ role: 'organiser', adminId: req.user._id }).select('_id');
    const orgIds = myOrganisers.map(org => org._id);

    const events = await Event.find({ organiserId: { $in: orgIds } })
      .populate('organiserId', 'name email')
      .populate('registeredStudents.userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve an event
 * @route   PUT /api/events/:id/approve
 * @access  Admin
 */
const approveEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the event's organiser belongs to the logged-in admin
    const organiser = await User.findById(event.organiserId);
    if (!organiser || organiser.adminId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: This event does not belong to your assigned organisers.' });
    }

    event.status = 'approved';
    await event.save();
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject an event
 * @route   PUT /api/events/:id/reject
 * @access  Admin
 */
const rejectEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the event's organiser belongs to the logged-in admin
    const organiser = await User.findById(event.organiserId);
    if (!organiser || organiser.adminId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: This event does not belong to your assigned organisers.' });
    }

    event.status = 'rejected';
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Student applies / registers for an event
 * @route   POST /api/events/apply/:id
 * @access  Student
 */
const applyToEvent = async (req, res) => {
  console.log("=== APPLY TO EVENT HIT ===");
  console.log("User ID:", req.user?._id);
  console.log("Event ID:", req.params.id);
  console.log("Body:", req.body);
  
  try {
    const { teamName, teamMembers, name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("Invalid Event ID Format");
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log("Event Not Found in DB");
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log("Found Event:", event.title, "Status:", event.status);

    // Check if event is actually approved
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Event is not accepting registrations' });
    }

    // Check if already applied
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already applied to this event' });
    }

    // Check capacity
    if (event.capacity > 0 && event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Team Event Validation
    if (event.isTeamEvent) {
      if (!teamName || !teamMembers || !Array.isArray(teamMembers)) {
        return res.status(400).json({ message: 'Team Name and Team Members are required for this event' });
      }
      if (teamMembers.length < event.minTeamSize || teamMembers.length > event.maxTeamSize) {
        return res.status(400).json({ message: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize} members` });
      }
    }

    // Save Registration
    event.attendees.push(req.user._id);
    event.registeredStudents.push({
      userId: req.user._id,
      participantName: event.isTeamEvent ? '' : name,
      teamName: event.isTeamEvent ? teamName : '',
      teamMembers: event.isTeamEvent ? teamMembers : [],
    });
    
    await event.save();

    // Send Confirmation Email
    const user = await User.findById(req.user._id);
    const subject = `Registration Confirmed: ${event.title}`;
    
    // Generate Digital Ticket QR Code and PDF
    const ticketId = `${event._id}-${req.user._id}`;
    let qrCodeDataUrl = '';
    let attachments = [];
    const uniqueCid = `ticketqr-${ticketId}@eventhub`;

    try {
      qrCodeDataUrl = await QRCode.toDataURL(ticketId, {
        color: { dark: '#000000', light: '#ffffff' },
        width: 300,
        margin: 2
      });

      const qrBase64Data = qrCodeDataUrl.split(',')[1];
      
      // 1. CID Attachment for Inline rendering in Email Body
      attachments.push({
        filename: 'qr-ticket.png',
        path: qrCodeDataUrl,
        cid: uniqueCid
      });

      // 2. Generate PDF Document Attachment
      const pdfBuffer = await new Promise((resolve) => {
        const doc = new PDFDocument({ size: [400, 600], margins: { top: 50, bottom: 50, left: 50, right: 50 } });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // PDF Styling & Content
        doc.fontSize(24).fillColor('#4f46e5').text('Event Ticket', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(16).fillColor('#111827').text(event.title, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#6b7280').text(`Attendee: ${user.name}`, { align: 'center' });
        doc.moveDown(2);
        
        // Stamp the QR image
        doc.image(Buffer.from(qrBase64Data, 'base64'), 100, doc.y, { width: 200, align: 'center' });
        doc.y += 220; // move past the image
        
        doc.fontSize(10).fillColor('#9ca3af').text(`ID: ${ticketId}`, { align: 'center' });
        doc.moveDown(2);

        // Details
        doc.fontSize(12).fillColor('#374151');
        doc.text(`Date: ${event.date}`);
        doc.text(`Time: ${event.time}`);
        doc.text(`Venue: ${event.location} ${event.collegeName ? `(${event.collegeName})` : ''}`);
        
        doc.end();
      });

      attachments.push({
        filename: `${event.title.replace(/\s+/g, '_')}_Ticket.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });

    } catch(err) {
      console.error("Failed to generate QR or PDF for email:", err);
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #374151;">
        <h2>Registration Successful!</h2>
        <p>Hi ${user.name},</p>
        <p>You have successfully registered for <strong>${event.title}</strong>. A PDF version of your ticket has been securely attached to this email.</p>
        
        <div style="text-align: center; margin: 30px 0; background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #f3f4f6;">
          <h3 style="color: #4f46e5; margin-bottom: 5px; margin-top: 0;">Your Digital Ticket</h3>
          <p style="font-size: 13px; color: #6b7280; margin-top: 0; margin-bottom: 15px;">Show this QR code at the venue to mark your attendance</p>
          ${qrCodeDataUrl ? `<img src="cid:${uniqueCid}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px; background: white;" />` : ''}
          <p style="font-size: 12px; color: #9ca3af; margin-top: 15px; font-family: monospace; letter-spacing: 1px;">ID: ${ticketId.substring(0, 12)}...</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Date:</strong> ${event.date}</p>
          <p style="margin: 8px 0;"><strong>Time:</strong> ${event.time}</p>
          <p style="margin: 8px 0;"><strong>Venue:</strong> ${event.location} ${event.collegeName ? `(${event.collegeName})` : ''}</p>
          <p style="margin: 8px 0;"><strong>Registration ID:</strong> <span style="font-family: monospace;">${ticketId}</span></p>
          ${event.isTeamEvent ? `
            <hr style="border: 1px solid #e5e7eb; margin: 15px 0;" />
            <p style="margin: 8px 0;"><strong>Team Name:</strong> ${teamName}</p>
            <p style="margin: 8px 0;"><strong>Team Size:</strong> ${teamMembers.length} members</p>
          ` : ''}
        </div>
        <p>We look forward to seeing you there!</p>
      </div>
    `;
    await sendEmail(user.email, subject, htmlContent, attachments);

    res.json({ message: 'Successfully applied to event', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get events the student has applied to
 * @route   GET /api/events/applied
 * @access  Student
 */
const getAppliedEvents = async (req, res) => {
  try {
    // Find events where the user is an attendee
    const events = await Event.find({ attendees: req.user._id })
      .populate('organiserId', 'name email')
      .sort({ date: -1 });

    // Map through events and attach user's specific registration details
    const formattedEvents = events.map(event => {
      const defaultInfo = { teamName: '', teamMembers: [], registeredAt: null };
      
      let registrationInfo = defaultInfo;
      if (event.registeredStudents && event.registeredStudents.length > 0) {
        const found = event.registeredStudents.find(
          r => r.userId && r.userId.toString() === req.user._id.toString()
        );
        if (found) registrationInfo = found;
      }

      return {
        ...event.toObject(),
        userRegistrationInfo: registrationInfo
      };
    });

    res.json(formattedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get analytics data for admin dashboard
 * @route   GET /api/events/analytics
 * @access  Admin
 */
const getAnalytics = async (req, res) => {
  try {
    const myOrganisers = await User.find({ role: 'organiser', adminId: req.user._id }).select('_id');
    const orgIds = myOrganisers.map(org => org._id);

    const totalEvents = await Event.countDocuments({ organiserId: { $in: orgIds } });
    const totalRegistrations = await Event.aggregate([
      { $match: { organiserId: { $in: orgIds } } },
      { $project: { count: { $size: '$attendees' } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);
    const pendingApprovals = await Event.countDocuments({ status: 'pending', organiserId: { $in: orgIds } });
    const activeOrganisers = orgIds.length;

    // Certificates \& Attendance might require knowing the specific events first
    const adminEvents = await Event.find({ organiserId: { $in: orgIds } }).select('_id');
    const adminEventIds = adminEvents.map(e => e._id);

    const certificatesIssued = await Certificate.countDocuments({ eventId: { $in: adminEventIds } });
    const totalAttendance = await Attendance.countDocuments({ eventId: { $in: adminEventIds } });
    const presentCount = await Attendance.countDocuments({ eventId: { $in: adminEventIds }, status: 'present' });
    const avgAttendance = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Monthly events (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyEvents = await Event.aggregate([
      { $match: { organiserId: { $in: orgIds }, date: { $gte: sixMonthsAgo.toISOString() } } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // "YYYY-MM"
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.json({
      totalEvents,
      totalRegistrations: totalRegistrations[0]?.total || 0,
      avgAttendance,
      pendingApprovals,
      activeOrganisers,
      certificatesIssued,
      monthlyEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Organiser (own event) or Admin
 */
const updateEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only the owning organiser or the assigned admin can update
    if (req.user.role === 'admin') {
      const organiser = await User.findById(event.organiserId);
      if (!organiser || organiser.adminId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized: This event does not belong to your assigned organisers.' });
      }
    } else if (event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const editableFields = [
      'title', 'description', 'date', 'time', 'location', 'collegeName',
      'capacity', 'category', 'isTeamEvent', 'minTeamSize', 'maxTeamSize',
      'posterUrl', 'prizePool', 'deadlines',
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];
        // Handle type coercion for specific fields
        if (field === 'capacity' || field === 'minTeamSize' || field === 'maxTeamSize') {
          value = Number(value) || 0;
        }
        if (field === 'isTeamEvent') {
          value = value === 'true' || value === true;
        }
        event[field] = value;
      }
    });

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Organiser (own event) or Admin
 */
const deleteEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Event ID format' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only the owning organiser or the assigned admin can delete
    if (req.user.role === 'admin') {
      const organiser = await User.findById(event.organiserId);
      if (!organiser || organiser.adminId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized: This event does not belong to your assigned organisers.' });
      }
    } else if (event.organiserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Also clean up related attendance and certificate records
    await Attendance.deleteMany({ eventId: req.params.id });
    await Certificate.deleteMany({ eventId: req.params.id });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getApprovedEvents,
  getMyEvents,
  getPendingEvents,
  getAllEvents,
  getPublicEvents,
  approveEvent,
  rejectEvent,
  applyToEvent,
  getAppliedEvents,
  getAnalytics,
  updateEvent,
  deleteEvent,
};
