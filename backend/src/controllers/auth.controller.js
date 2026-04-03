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
    return successResponse(res, { user: req.user }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const token = await authService.forgotPassword(req.body.email);
    // Testing override: return token in response temporarily
    return successResponse(res, { localTestToken: token }, 'Password reset linked dispatched.', 200);
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
