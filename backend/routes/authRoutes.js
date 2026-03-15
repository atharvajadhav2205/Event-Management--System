const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

// POST /api/auth/signup — Register a new user
router.post('/signup', signup);

// POST /api/auth/login — Authenticate & get token
router.post('/login', login);

module.exports = router;
