const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validateRequest');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, refreshTokenSchema } = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/authMiddleware');

// Public Routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);

// Protected Routes
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
