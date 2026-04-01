const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- Middleware ---
const clientOrigin = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.replace(/\/$/, '') 
  : 'http://localhost:5173';

app.use(cors({
  origin: clientOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// Health-check
app.get('/api/health', (req, res) => {
  res.json({ message: 'EventHub API is running 🚀', timestamp: new Date().toISOString() });
});

// --- Serve Frontend in Production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'EventHub API is running 🚀' });
  });
}

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});