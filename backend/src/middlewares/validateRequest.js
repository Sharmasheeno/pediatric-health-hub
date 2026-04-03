const { errorResponse } = require('../utils/responseWrapper');

const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      // Format Zod errors cleanly
      const formattedErrors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return errorResponse(res, 'Validation Error', 400, formattedErrors);
    }
    req[source] = result.data; // Reassign with validated, typed payload
    next();
  };
};

module.exports = validateRequest;
