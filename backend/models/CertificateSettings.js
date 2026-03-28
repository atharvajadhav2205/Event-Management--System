const mongoose = require('mongoose');

const certificateSettingsSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    unique: true,
  },
  templatePath: {
    type: String,
    default: '',
  },
  templateCloudinaryUrl: {
    type: String,
    default: '',
  },
  templateType: {
    type: String,
    enum: ['pdf', 'png', 'jpg', 'jpeg'],
    default: 'png',
  },
  namePositionX: {
    type: Number,
    default: 50, // percentage from left
  },
  namePositionY: {
    type: Number,
    default: 50, // percentage from top
  },
  fontSize: {
    type: Number,
    default: 40,
  },
  fontFamily: {
    type: String,
    default: 'Helvetica',
  },
  textColor: {
    type: String,
    default: '#000000',
  },
});

module.exports = mongoose.model('CertificateSettings', certificateSettingsSchema);
