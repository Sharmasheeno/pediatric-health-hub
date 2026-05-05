const { z } = require('zod');
const { strongPasswordSchema } = require('./auth.validator');

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().transform(Number),
  limit: z.string().regex(/^\d+$/).optional().transform(Number),
  search: z.string().optional()
});

const updateUserSchema = z.object({
  isActive: z.boolean().optional()
});

const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: strongPasswordSchema,
  role: z.enum(['PARENT', 'DOCTOR', 'FACILITY', 'ADMIN'], {
    errorMap: () => ({ message: "Invalid role specified" })
  })
});

module.exports = { querySchema, updateUserSchema, createUserSchema };
