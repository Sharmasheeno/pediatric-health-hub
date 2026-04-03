const { errorResponse } = require('../utils/responseWrapper');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle specific errors like Zod validation or Prisma exceptions here
  if (err.name === 'ZodError') {
    return errorResponse(res, 'Validation Error', 400, err.errors);
  }

  // Fallback for unhandled errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
