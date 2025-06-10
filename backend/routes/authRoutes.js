const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { requestPasswordReset } = require('../controllers/passwordController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
module.exports = router;
