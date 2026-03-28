const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, signup, login, getAdmins } = require('../controllers/authController');

// POST /api/auth/send-otp — Send OTP
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp — Verify OTP
router.post('/verify-otp', verifyOtp);

// POST /api/auth/signup — Register a new user
router.post('/signup', signup);

// POST /api/auth/login — Authenticate & get token
router.post('/login', login);

// GET /api/auth/admins — Get all admins for signup
router.get('/admins', getAdmins);

module.exports = router;
