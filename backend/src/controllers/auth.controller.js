const authService = require('../services/auth.service');
const { successResponse } = require('../utils/responseWrapper');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body, req);
    return successResponse(res, result, 'User registered successfully', 201);
  } catch (error) {
    next(error); 
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password, req);
    return successResponse(res, result, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    let profile = null;
    if (req.user.role === 'PARENT') {
      profile = await prisma.parentProfile.findUnique({ where: { userId: req.user.id } });
    } else if (req.user.role === 'DOCTOR') {
      profile = await prisma.doctorProfile.findUnique({ where: { userId: req.user.id } });
    } else if (req.user.role === 'FACILITY') {
      profile = await prisma.facilityProfile.findUnique({ where: { userId: req.user.id } });
    }
    
    const fullUser = { ...req.user, profile };
    return successResponse(res, { user: fullUser }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return success to prevent email enumeration
    return successResponse(res, null, 'If an account with that email exists, a verification code has been sent.', 200);
  } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return successResponse(res, null, 'Password reset successfully', 200);
  } catch (error) { next(error); }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.body.token);
    return successResponse(res, null, 'Email verified successfully', 200);
  } catch (error) { next(error); }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    return successResponse(res, result, 'Access token refreshed dynamically', 200);
  } catch (error) { next(error); }
};

module.exports = { register, login, getProfile, forgotPassword, resetPassword, verifyEmail, refreshToken };
