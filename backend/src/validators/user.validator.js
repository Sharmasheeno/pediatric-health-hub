const { z } = require('zod');

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().transform(Number),
  limit: z.string().regex(/^\d+$/).optional().transform(Number),
  search: z.string().optional()
});

const updateUserSchema = z.object({
  isActive: z.boolean().optional()
});

module.exports = { querySchema, updateUserSchema };
