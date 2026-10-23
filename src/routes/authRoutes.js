const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, passwordResetLimiter } = require('../middlewares/securityMiddleware');

// Halaman Login & Register
router.get('/login', authController.getLoginPage);
router.get('/register', authController.getRegisterPage);

// Proses Login & Register (Proteksi Anti-Brute Force)
router.post('/login', authLimiter, authController.loginProcess);
router.post('/register', authLimiter, authController.registerProcess);

// Logout
router.get('/logout', authController.logout);

// Fitur Lupa Password & Reset Password
router.get('/forgot-password', authController.getForgotPasswordPage);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPasswordProcess);
router.get('/reset-password/:token', authController.getResetPasswordPage);
router.post('/reset-password/:token', passwordResetLimiter, authController.resetPasswordProcess);

module.exports = router;