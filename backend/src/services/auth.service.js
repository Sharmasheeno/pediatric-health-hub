const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwtHelper');
const { logAction } = require('./audit.service');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const registerUser = async (userData, req) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
  const verifyTokenStr = crypto.randomBytes(32).toString('hex');
  const hashedVerifyToken = crypto.createHash('sha256').update(verifyTokenStr).digest('hex');

  // Cross-model transactional registration
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        verifyToken: hashedVerifyToken
      }
    });

    if (userData.role === 'PARENT') {
      await tx.parentProfile.create({
        data: {
          userId: user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber
        }
      });
    } else if (userData.role === 'DOCTOR') {
       await tx.doctorProfile.create({
        data: {
          userId: user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          licenseNumber: userData.licenseNumber || 'PENDING',
          specialization: userData.specialization || 'GENERAL'
        }
      });
    } else if (userData.role === 'FACILITY') {
       await tx.facilityProfile.create({
        data: {
          userId: user.id,
          name: userData.firstName + ' ' + userData.lastName,
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || ''
        }
      });
    }
    return user;
  });

  if (req) {
    await logAction(newUser.id, 'REGISTER', 'User', newUser.id, { role: newUser.role }, req);
  }

  const { password, ...userWithoutPassword } = newUser;
  const token = generateToken(newUser.id, newUser.role);
  
  // NOTE: In production, verifyTokenStr would be intercepted via an email service dispatch right here.
  return { user: userWithoutPassword, token, verificationToken: verifyTokenStr };
};

const loginUser = async (email, password, req) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.deletedAt || !user.isActive) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (req) {
    await logAction(user.id, 'LOGIN', 'User', user.id, null, req);
  }

  const { password: _, ...userWithoutPassword } = user;
  
  // Attach profile data dynamically
  let profile = null;
  if (user.role === 'PARENT') {
      profile = await prisma.parentProfile.findUnique({ where: { userId: user.id } });
  } else if (user.role === 'DOCTOR') {
      profile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
  } else if (user.role === 'FACILITY') {
      profile = await prisma.facilityProfile.findUnique({ where: { userId: user.id } });
  }
  userWithoutPassword.profile = profile;

  const token = generateToken(user.id, user.role);
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  // Store session mapping
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });

  return { user: userWithoutPassword, token, refreshToken };
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null; // Silent abort prevents email enumeration attacks

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedOtp,
      resetTokenExp: new Date(Date.now() + 10 * 60 * 1000) // 10 minute validity
    }
  });

  // Send OTP via Gmail SMTP
  const { sendOTPEmail } = require('../utils/emailService');
  await sendOTPEmail(email, otp);

  return true; // Don't leak the OTP in the response
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: { resetToken: hashedToken, resetTokenExp: { gt: new Date() } }
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
      refreshToken: null // Global Session Outage on Security Breach Fix
    }
  });
};

const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({ where: { verifyToken: hashedToken } });
  
  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, verifyToken: null }
  });
};

const refreshAccessToken = async (token) => {
  const user = await prisma.user.findFirst({ where: { refreshToken: token } });
  
  if (!user || user.deletedAt || !user.isActive) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  // Issue brand-new short-lived access token
  const newAccessToken = generateToken(user.id, user.role);
  return { token: newAccessToken };
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail, refreshAccessToken };
