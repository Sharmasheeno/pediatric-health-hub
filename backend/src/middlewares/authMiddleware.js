const { verifyToken } = require('../utils/jwtHelper');
const { errorResponse } = require('../utils/responseWrapper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 'Token expired or invalid', 401);
    }

    // Verify user still exists and hasn't been logically deleted
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.deletedAt) {
      return errorResponse(res, 'User account no longer active', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    return errorResponse(res, 'Internal Authentication Error', 500);
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions to access this resource', 403);
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
