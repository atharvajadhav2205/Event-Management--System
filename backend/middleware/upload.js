const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure both upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const templateDir = path.join(__dirname, '../uploads/templates');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true });
}

// Set Storage Engine dynamically based on the field name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'certificateTemplate') {
      cb(null, templateDir); // Send templates to the template folder
    } else {
      cb(null, uploadDir);   // Send general attachments to the main uploads folder
    }
  },
  filename: function (req, file, cb) {
    // Generate a unique, safe file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

// Check File Type dynamically based on the field name
function checkFileType(file, cb) {
  if (file.fieldname === 'certificateTemplate') {
    // Strict image validation for templates
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    } else {
      cb(new Error('Template Error: Only .png, .jpg and .jpeg images are allowed'));
    }
  } else {
    // Broader validation for general event attachments
    const filetypes = /jpeg|jpg|png|gif|pdf|ppt|pptx|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Attachment Error: Images, PDFs, and PPTs Only!'));
    }
  }
}

// Init Upload (Set to 50MB to accommodate large attachments)
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;