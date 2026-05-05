const { errorResponse } = require('../utils/responseWrapper');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle specific errors like Zod validation or Prisma exceptions here
  if (err.name === 'ZodError') {
    return errorResponse(res, 'Validation Error', 400, err.errors);
  }

  // Handle Prisma Unique Constraint Violations
  if (err.code === 'P2002') {
    const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'unique identifier';
    return errorResponse(res, `This record already exists. The ${target} must be strictly unique.`, 409);
  } else if (err.code === 'P2003') {
    // Handle Prisma Foreign Key Constraint Violations
    const field = err.meta?.field_name || 'related record';
    return errorResponse(res, `Invalid relationship reference: The specified ${field} does not exist in the database.`, 400);
  }

  // Fallback for unhandled errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
